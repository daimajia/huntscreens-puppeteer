import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { type NextRequest } from 'next/server';
import redis from "@/lib/redis";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if(!url || url.length === 0) {
    return NextResponse.json( {
      error: true,
      source: null
    })
  }
  const data = await redis.get(url);
  if(data) {
    return NextResponse.json({
      error: false,
      source: data
    })
  }
  const install = require(`puppeteer/internal/node/install.js`).downloadBrowser;
  await install();
  
  const browser = await puppeteer.launch({
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--single-process", "--no-sandbox"],
    headless: true,
  });

  const page = await browser.newPage();

  const customUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36';
  await page.setUserAgent(customUA);

  await page.goto(url);
  const content = await page.evaluate(() => document.body.innerHTML);
  await redis.set(url, content, 'EX', 60 * 60 * 6);
  return NextResponse.json({
    error: false,
    source: content
  })
}