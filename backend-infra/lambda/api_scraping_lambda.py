from fastapi import FastAPI, HTTPException
from mangum import Mangum
from pydantic import BaseModel, HttpUrl
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
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

chrome_binary_path = '/opt/headless-chromium'
chromedriver_path = '/opt/chromedriver'

os.environ['CHROME_BINARY_PATH'] = chrome_binary_path

class UrlInput(BaseModel):
    url: HttpUrl

def scrape_job_offer(url):
    # Set up Selenium with Chrome in headless mode
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    chrome_options.binary_location = chrome_binary_path

    driver = webdriver.Chrome(executable_path=chromedriver_path, options=chrome_options)

    try:
        driver.get(url)

        # Wait for the job title to be present
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "jobsearch-JobInfoHeader-title"))
        )

        # Scroll to load all content
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)  # Wait for any lazy-loaded content

        html_content = driver.page_source
        soup = BeautifulSoup(html_content, 'html.parser')

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

def query_bedrock(job_data):
    prompt = f"""Analyze the following job offer and provide key insights:

Job Title: {job_data['title']}
Company: {job_data['company']}
Location: {job_data['location']}
Job Type: {job_data['job_type']}
Skills Required: {', '.join(job_data['skills_required'])}
Education Required: {', '.join(job_data['education_required'])}

Job Description:
{job_data['description']}

Please provide:
1. A summary of the main responsibilities
2. Key qualifications and skills needed
3. Any unique or standout aspects of this job offer
4. Potential challenges or opportunities in this role
5. Advice for potential applicants
"""

    try:
        response = bedrock.invoke_model(
            modelId="anthropic.claude-v2",  # Use the appropriate model ID
            body=json.dumps({
                "prompt": prompt,
                "max_tokens_to_sample": 500,
                "temperature": 0.7,
                "top_p": 1,
            })
        )
        
        return json.loads(response['body'].read())['completion']
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while querying Bedrock: {str(e)}")

@app.post("/scrapeJobOffer")
async def scrape_job_offer_endpoint(url_input: UrlInput):
    job_data = scrape_job_offer(str(url_input.url))
    insights = query_bedrock(job_data)
    
    return {
        "job_data": job_data,
        "insights": insights
    }

handler = Mangum(app)