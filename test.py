import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time

def scrape_job_offer(url):
    # Set up Selenium with Chrome in headless mode
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

    driver = webdriver.Chrome(options=chrome_options)

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

        return json.dumps(job_data, ensure_ascii=False, indent=2)

    except Exception as e:
        return json.dumps({"error": f"An error occurred: {str(e)}"})

    finally:
        driver.quit()
url = "https://fr.indeed.com/voir-emploi?jk=dcd0274e19d7435f"
result = scrape_job_offer(url)
print(result)