import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (Server-side) safely
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle newlines in the private key correctly
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, title, message, url } = body;

    if (!token) {
        return NextResponse.json({ error: 'FCM Token is required' }, { status: 400 });
    }

    const payload = {
      notification: {
        title: title || 'SajuChain 알림',
        body: message || '새로운 운세가 도착했습니다.',
      },
      data: {
        url: url || '/', // URL to redirect when notification is clicked
      },
      token: token,
    };

    // Send the push notification via Firebase Admin SDK
    const response = await admin.messaging().send(payload);
    
    return NextResponse.json({ 
        success: true, 
        message: 'Notification sent successfully',
        messageId: response
    });
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
