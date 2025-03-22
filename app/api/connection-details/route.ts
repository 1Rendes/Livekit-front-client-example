import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;
const accessToken = process.env.ACCESSTOKEN;
const userId = process.env.USER_ID;
console.log("API_KEY: ", API_KEY);
const axiosInstance = axios.create({ baseURL: "http://localhost:3001/api" });
// don't cache the results
export const revalidate = 0;
type TokenPayload = {
  sub: string;
  video: {
    room: string;
    roomJoin: boolean;
  };
};

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export async function GET() {
  try {
    if (LIVEKIT_URL === undefined) {
      throw new Error("LIVEKIT_URL is not defined");
    }
    if (API_KEY === undefined) {
      throw new Error("LIVEKIT_API_KEY is not defined");
    }
    if (API_SECRET === undefined) {
      throw new Error("LIVEKIT_API_SECRET is not defined");
    }
    const response = await axiosInstance.get(
      `/livekit-token?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const decoded: TokenPayload = jwtDecode(response.data.token);
    const token = response.data.token;
    if (decoded) {
      const data: ConnectionDetails = {
        serverUrl: LIVEKIT_URL,
        roomName: decoded.video.room,
        participantToken: token,
        participantName: decoded.sub,
      };
      const headers = new Headers({
        "Cache-Control": "no-store",
      });
      console.log("data: ", data);
      return NextResponse.json(data, { headers });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}
