import boto3
import json
import os

bedrock = boto3.client('bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
status_table = dynamodb.Table(os.environ['STATUS_TABLE_NAME'])

def query_bedrock(job_data):
    # Prepare the prompt for Bedrock
    prompt = f"""
    <|begin_of_text|><|start_header_id|>system<|end_header_id|>
    You are an AI assistant that generates CVs, motivation letters, and job compatibility percentages. You must always respond with a single, valid JSON object. Do not include any text outside of the JSON structure. Write the JSON in ONE LINE NO FORMATTING CHARACTERS.
    <|eot_id|>

    <|start_header_id|>user<|end_header_id|>
    Generate a custom CV, motivation letter, and job compatibility percentage for the following job posting:

    Job Title: {job_data['job_title']}
    Company: {job_data['company_name']}
    Location: {job_data['location']}
    Job Description: {job_data['job_description']}
    Requirements: {', '.join(job_data['requirements'])}
    Salary Range: {job_data['salary_range']}

    Generate a professional CV, a tailored motivation letter, and calculate a job compatibility percentage based on how well a typical candidate's profile matches the job requirements.

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
    
    response_body = json.loads(response.get('body').read())
    
    # Extract generated content
    try:
        generated_content = json.loads(response_body['generation'])
        return generated_content
    except json.JSONDecodeError:
        raise Exception("Failed to generate properly formatted response")

def lambda_handler(event, context):
    job_id = event['jobId']
    
    try:
        # Get job data from DynamoDB
        response = status_table.get_item(Key={'jobId': job_id})
        job_data = json.loads(response['Item']['jobData'])
        
        generated_content = query_bedrock(job_data)
        
        # Update status to 'COMPLETED' with generated content
        status_table.update_item(
            Key={'jobId': job_id},
            UpdateExpression='SET #s = :s, #r = :r',
            ExpressionAttributeNames={'#s': 'status', '#r': 'result'},
            ExpressionAttributeValues={':s': 'COMPLETED', ':r': json.dumps(generated_content)}
        )
        
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Processing completed"})
        }
    except Exception as e:
        # Update status to 'FAILED'
        status_table.update_item(
            Key={'jobId': job_id},
            UpdateExpression='SET #s = :s, #e = :e',
            ExpressionAttributeNames={'#s': 'status', '#e': 'error'},
            ExpressionAttributeValues={':s': 'FAILED', ':e': str(e)}
        )
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }