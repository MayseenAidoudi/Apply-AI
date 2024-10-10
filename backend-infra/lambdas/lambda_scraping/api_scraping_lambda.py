import uuid
from fastapi import FastAPI, HTTPException
from mangum import Mangum
from pydantic import BaseModel, HttpUrl
import boto3
import json
import os
from firecrawl import FirecrawlApp

# Initialize Bedrock, Lambda, and DynamoDB clients
bedrock = boto3.client('bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
status_table = dynamodb.Table(os.environ['STATUS_TABLE_NAME'])

# Firecrawl API initialization
app = FirecrawlApp(api_key=os.environ['FIRECRAWL_API_KEY'])

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
        job_data = app.scrape_url(url, {
            'formats': ['extract'],
            'extract': {
                'schema': JobExtractSchema.model_json_schema(),
            }
        })
        
        return job_data['extract']
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error occurred while scraping job offer: {str(e)}")

def generate_cv_and_motivation_letter(job_data, user_profile):
    # Prepare the prompt for Bedrock
    prompt = f"""
    Create a custom CV and motivation letter for the following job posting:
    
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
    
    Generate both a professional CV and a tailored motivation letter for this job.
    """

    # Call AWS Bedrock to process the prompt
    response = bedrock.invoke_model(
        modelId=os.environ['BEDROCK_MODEL_ID'],  # Specify the correct model for text generation
        contentType="application/json",
        accept="application/json",
        body=json.dumps({
            "input": prompt
        })
    )

    response_body = json.loads(response['body'])
    
    # Extract generated CV and motivation letter
    generated_text = response_body['generated_text']
    
    return generated_text

@fastapi_app.post("/scrapeAndGenerate")
async def scrape_and_generate(url_input: UrlInput, user_profile: dict):
    job_id = str(uuid.uuid4())
    
    # Update the DynamoDB status table to 'SCRAPING'
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
        
        # Update status to 'PROCESSING'
        status_table.update_item(
            Key={'jobId': job_id},
            UpdateExpression='SET #s = :s, #jd = :jd',
            ExpressionAttributeNames={'#s': 'status', '#jd': 'jobData'},
            ExpressionAttributeValues={':s': 'PROCESSING', ':jd': json.dumps(job_data)}
        )
        
        # Generate custom CV and motivation letter using Bedrock
        generated_cv_and_letter = generate_cv_and_motivation_letter(job_data, user_profile)
        
        # Update the status to 'COMPLETED'
        status_table.update_item(
            Key={'jobId': job_id},
            UpdateExpression='SET #s = :s, #result = :r',
            ExpressionAttributeNames={'#s': 'status', '#r': 'result'},
            ExpressionAttributeValues={':s': 'COMPLETED', ':r': generated_cv_and_letter}
        )
        
        return {"jobId": job_id, "message": "Job scraping and document generation completed", "result": generated_cv_and_letter}
    
    except Exception as e:
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
