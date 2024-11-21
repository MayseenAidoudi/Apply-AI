import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel, HttpUrl, Field
import boto3
import json
import os
from firecrawl import FirecrawlApp
import logging

# Initialize Boto3 clients
dynamodb = boto3.resource('dynamodb')
lambda_client = boto3.client('lambda')
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
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],

)

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

@fastapi_app.post("/scrapeAndGenerate")
async def scrape(url_input: UrlInput, user_profile: dict):
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
        
        # Invoke the second Lambda function
        logger.info(f"Invoking AI processing Lambda for job ID: {job_id}")
        lambda_client.invoke(
            FunctionName='arn:aws:lambda:eu-west-2:197371229171:function:MyBackendStack-AIProcessingLambda989B1A23-F5ZhNdThoEaK',
            InvocationType='Event',
            Payload=json.dumps({'jobId': job_id, 'userProfile' : user_profile})
        )
        
        return {"jobId": job_id, "message": "Job scraping completed and AI processing initiated"}
    
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