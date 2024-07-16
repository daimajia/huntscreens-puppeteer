import {  NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const install = require(`puppeteer/internal/node/install.js`).downloadBrowser;
  await install();
  const url = request.nextUrl.searchParams.get('url');

  if(!url) 
  return NextResponse.json( {
    error: true,
    source: null
  })

  const browser = await puppeteer.launch({
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--single-process", "--no-sandbox"],
    headless: true,
  });

  const page = await browser.newPage();

  const customUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36';
  await page.setUserAgent(customUA);

  await page.goto(url);
  const content = await page.evaluate(() => document.body.innerHTML); 
  return NextResponse.json({
    error: false,
    source: content
  })
}