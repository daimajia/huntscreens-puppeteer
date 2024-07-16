export const revalidate = 300 // revalidate at most every 5 minutes
export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1>Puppeteer API</h1>
    </main>
  );
}
