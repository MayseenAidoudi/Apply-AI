import { NextResponse } from 'next/server';
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";

const dynamoDb = DynamoDBDocument.from(new DynamoDB({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
}));

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const existingUser = await dynamoDb.get({
      TableName: "Users",
      Key: { email },
    });

    if (existingUser.Item) {
      return NextResponse.json({ error: "A user with the same email address already exists, please login" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await dynamoDb.put({
      TableName: "Users",
      Item: {
        email,
        name,
        password: hashedPassword,
        credits: 100,
        profile: {},
      },
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }
}