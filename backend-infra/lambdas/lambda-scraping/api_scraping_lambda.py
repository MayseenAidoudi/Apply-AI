import uuid
from fastapi import FastAPI, HTTPException
from mangum import Mangum
from pydantic import BaseModel, HttpUrl
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import boto3
import json
import time
import os

app = FastAPI()
bedrock = boto3.client('bedrock-runtime')
lambda_client = boto3.client('lambda')
dynamodb = boto3.resource('dynamodb')
status_table = dynamodb.Table(os.environ['STATUS_TABLE_NAME'])

chrome_binary_path = '/opt/headless-chromium'
chromedriver_path = '/opt/chromedriver'

os.environ['CHROME_BINARY_PATH'] = chrome_binary_path

class UrlInput(BaseModel):
    url: HttpUrl

    

def scrape_job_offer(url):
    # Set up paths for the binary and chromedriver
    chromedriver_path = "/opt/chrome-driver/chromedriver-linux64/chromedriver"  # Update this path based on your setup
    chrome_binary_path = "/opt/chrome/chrome-linux64/chrome"  # Update this path based on your setup

    # Set up Selenium with Chrome in headless mode
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    chrome_options.binary_location = chrome_binary_path

    # Use Service class to specify chromedriver path
    service = Service(executable_path=chromedriver_path)

    # Pass the service and options to the Chrome WebDriver
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        driver.get(url)

        # Wait for the job title to be present
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "jobsearch-JobInfoHeader-title"))
        )

        # Scroll to load all content
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)  # Wait for any lazy-loaded content

        # Parse the page source with BeautifulSoup
        html_content = driver.page_source
        print(html_content)
        soup = BeautifulSoup(html_content, 'html.parser')

        # Extract job details
        job_data = {
            "title": soup.find("h2", class_="jobsearch-JobInfoHeader-title").text.strip() if soup.find("h2", class_="jobsearch-JobInfoHeader-title") else "N/A",
            "company": soup.find("div", {"data-company-name": "true"}).text.strip() if soup.find("div", {"data-company-name": "true"}) else "N/A",
            "location": soup.find("div", {"data-testid": "jobsearch-JobInfoHeader-companyLocation"}).text.strip() if soup.find("div", {"data-testid": "jobsearch-JobInfoHeader-companyLocation"}) else "N/A",
            "job_type": soup.find("span", class_="css-k5flys").text.strip() if soup.find("span", class_="css-k5flys") else "N/A",
            "description": soup.find("div", id="jobDescriptionText").text.strip() if soup.find("div", id="jobDescriptionText") else "N/A",
            "skills_required": [],
            "education_required": []
        }

        # Extract skills and education from the profile insights section
        profile_insights = soup.find("div", id="mosaic-vjProfileInsights")
        if profile_insights:
            skills = profile_insights.find_all("button", {"data-testid": lambda x: x and x.endswith("-tile")})
            for skill in skills:
                h3 = skill.find_previous("h3")
                if h3 and "Compétences" in h3.text:
                    job_data["skills_required"].append(skill.text.strip())
                elif h3 and "Formation" in h3.text:
                    job_data["education_required"].append(skill.text.strip())

        return job_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while scraping: {str(e)}")

    finally:
        driver.quit()


@app.post("/scrapeJobOffer")
async def scrape_job_offer_endpoint(url_input: UrlInput):
    job_id = str(uuid.uuid4())
    
    # Update status to 'SCRAPING'
    status_table.put_item(
        Item={
            'jobId': job_id,
            'status': 'SCRAPING',
            'url': str(url_input.url)
        }
    )
    
    try:
        job_data = scrape_job_offer(url_input.url)
        
        # Update status to 'PROCESSING'
        status_table.update_item(
            Key={'jobId': job_id},
            UpdateExpression='SET #s = :s, #jd = :jd',
            ExpressionAttributeNames={'#s': 'status', '#jd': 'jobData'},
            ExpressionAttributeValues={':s': 'PROCESSING', ':jd': json.dumps(job_data)}
        )
        
        # Invoke AI processing Lambda
        lambda_client.invoke(
            FunctionName='AIProcessingLambda',
            InvocationType='Event',
            Payload=json.dumps({'jobId': job_id})
        )
        
        return {"jobId": job_id, "message": "Job offer scraping initiated"}
    except Exception as e:
        # Update status to 'FAILED'
        status_table.update_item(
            Key={'jobId': job_id},
            UpdateExpression='SET #s = :s, #e = :e',
            ExpressionAttributeNames={'#s': 'status', '#e': 'error'},
            ExpressionAttributeValues={':s': 'FAILED', ':e': str(e)}
        )
        raise HTTPException(status_code=500, detail=str(e))

handler = Mangum(app)
