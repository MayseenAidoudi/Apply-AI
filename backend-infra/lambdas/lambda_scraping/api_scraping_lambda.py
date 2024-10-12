import uuid
from fastapi import FastAPI, HTTPException
from mangum import Mangum
from pydantic import BaseModel, HttpUrl, Field
import boto3
import json
import os
from firecrawl import FirecrawlApp
import logging

# Initialize Bedrock, Lambda, and DynamoDB clients
bedrock = boto3.client('bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
status_table = dynamodb.Table(os.environ['STATUS_TABLE_NAME'])
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()
# Firecrawl API initialization

ssm = boto3.client('ssm')
parameter = ssm.get_parameter(Name=os.getenv('FIRECRAWL_API_KEY_PARAM'), WithDecryption=True)
firecrawl_api_key = parameter['Parameter']['Value']
app = FirecrawlApp(api_key=firecrawl_api_key)

# FastAPI app setup
fastapi_app = FastAPI()

class JobExtractSchema(BaseModel):
    job_title: str = Field(..., description="The title of the job position")
    company_name: str = Field(..., description="The name of the company offering the job")
    location: str = Field(..., description="The location of the job")
    job_description: str = Field(..., description="A brief description of the job")
    requirements: list[str] = Field(..., description="List of job requirements")
    salary_range: str = Field(..., description="The salary range for the position, if available")

class UrlInput(BaseModel):
    url: HttpUrl

def scrape_job_offer(url):
    try:
        # Use Firecrawl to scrape job details
        logger.info(f"Scraping URL: {url}")
        job_data = app.scrape_url(url, {
            'formats': ['extract'],
            'extract': {
                'schema': JobExtractSchema.schema(),
            }
        })
        logger.info(f"Scraped data: {job_data['extract']}")
        return job_data['extract']
    except Exception as e:
        logger.error(f"Error scraping job offer: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error occurred while scraping job offer: {str(e)}")

def generate_cv_and_motivation_letter(job_data, user_profile):
    # Prepare the prompt for Bedrock
    prompt = f"""
    <|begin_of_text|><|start_header_id|>system<|end_header_id|>
    You are an AI assistant that generates CVs, motivation letters, and job compatibility percentages. You must always respond with a single, valid JSON object. Do not include any text outside of the JSON structure. Write the JSON in ONE LINE NO FORMATING CARACTERS.
    <|eot_id|>

    <|start_header_id|>user<|end_header_id|>
    Generate a custom CV, motivation letter, and job compatibility percentage for the following job posting:

    Job Title: {job_data['job_title']}
    Company: {job_data['company_name']}
    Location: {job_data['location']}
    Job Description: {job_data['job_description']}
    Requirements: {', '.join(job_data['requirements'])}
    Salary Range: {job_data['salary_range']}

    Based on the user's profile:
    Name: {user_profile['name']}
    Skills: {', '.join(user_profile['skills'])}
    Experience: {user_profile['experience']}
    Education: {user_profile['education']}

    Generate a professional CV, a tailored motivation letter, and calculate a job compatibility percentage based on how well the user's profile matches the job requirements.

    Respond with a JSON object using the following structure:
    {{
        "cv": "The generated CV content",
        "motivation_letter": "The generated motivation letter content",
        "compatibility_percentage": 85
    }}

    Important:
    1. Ensure the JSON is properly formatted and can be parsed by Python's json.loads() function.
    2. The "cv" and "motivation_letter" values must be strings with proper escaping for any special characters.
    3. The "compatibility_percentage" must be a number between 0 and 100.
    4. Do not include any explanations or additional text outside the JSON structure.
    <|eot_id|>

    <|start_header_id|>assistant<|end_header_id|>"""

    # Call AWS Bedrock to process the prompt
    response = bedrock.invoke_model(
        modelId=os.environ['BEDROCK_MODEL_ID'],
        contentType="application/json",
        accept="application/json",
        body=json.dumps({
            "prompt": prompt,
            "max_gen_len": 2000,
            "temperature": 0.7,
            "top_p": 0.8,
        })
    )
    logger.info(f"Received response from Bedrock: {response}")
    response_body = json.loads(response.get('body').read())
    
    # Extract generated content
    try:
        generated_content = json.loads(response_body['generation'])
        return generated_content
    except json.JSONDecodeError:
        logger.error(f"Failed to parse JSON from model response {response_body['generation']}")
        raise HTTPException(status_code=500, detail="Failed to generate properly formatted response")
    

@fastapi_app.post("/scrapeAndGenerate")
async def scrape_and_generate(url_input: UrlInput, user_profile: dict):
    job_id = str(uuid.uuid4())
    logger.info(f"Job ID generated: {job_id}")

    # Update the DynamoDB status table to 'SCRAPING'
    logger.info(f"Updating DynamoDB with SCRAPING status for job ID: {job_id}")
    status_table.put_item(
        Item={
            'jobId': job_id,
            'status': 'SCRAPING',
            'url': str(url_input.url)
        }
    )
    
    try:
        # Scrape job details using Firecrawl
        job_data = scrape_job_offer(url_input.url)
        logger.info(f"Scraped job data: {job_data}")

        # Update status to 'PROCESSING'
        logger.info(f"Updating DynamoDB to PROCESSING for job ID: {job_id}")
        status_table.update_item(
            Key={'jobId': job_id},
            UpdateExpression='SET #s = :s, #jd = :jd',
            ExpressionAttributeNames={'#s': 'status', '#jd': 'jobData'},
            ExpressionAttributeValues={':s': 'PROCESSING', ':jd': json.dumps(job_data)}
        )
        
        # Generate custom CV, motivation letter, and compatibility percentage using Bedrock
        generated_content = generate_cv_and_motivation_letter(job_data, user_profile)
        
        logger.info("Successfully generated CV, motivation letter, and compatibility percentage.")

        # Update the status to 'COMPLETED'
        logger.info(f"Updating DynamoDB to COMPLETED for job ID: {job_id}")
        status_table.update_item(
            Key={'jobId': job_id},
            UpdateExpression='SET #s = :s, #r = :r',
            ExpressionAttributeNames={'#s': 'status', '#r': 'result'},
            ExpressionAttributeValues={':s': 'COMPLETED', ':r': json.dumps(generated_content)}
        )
        
        return {"jobId": job_id, "message": "Job scraping and document generation completed", "result": generated_content}
    
    except Exception as e:
        logger.error(f"Error processing job: {str(e)}")
        # Update status to 'FAILED'
        status_table.update_item(
            Key={'jobId': job_id},
            UpdateExpression='SET #s = :s, #e = :e',
            ExpressionAttributeNames={'#s': 'status', '#e': 'error'},
            ExpressionAttributeValues={':s': 'FAILED', ':e': str(e)}
        )
        raise HTTPException(status_code=500, detail=str(e))

# Create Lambda handler
handler = Mangum(fastapi_app)