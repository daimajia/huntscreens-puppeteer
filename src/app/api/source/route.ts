import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { type NextRequest } from 'next/server';
import redis from "@/lib/redis";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if(!url || url.length === 0) {
    return NextResponse.json( {
      error: true,
      source: null,
      msg: "url is invalid"
    })
  }
  const data = await redis.get(url);
  if(data) {
    return NextResponse.json({
      error: false,
      source: data
    })
  }
  let browser;
  try{
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });
  
  
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
  
    const customUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36';
    await page.setUserAgent(customUA);
  
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url);
    const content = await page.content();
    await redis.set(url, content, 'EX', 60 * 60 * 6);
    return NextResponse.json({
      error: false,
      source: content,
      msg: "success"
    })
  }catch(e) {
    console.error("Got error:", url, e);
    return NextResponse.json({
      error: true,
      msg: e,
      source: ""
    })
  }finally {
    if(browser){
      await browser.close();  
    }
  }
}