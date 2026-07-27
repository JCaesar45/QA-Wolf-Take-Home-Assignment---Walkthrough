import asyncio
import aiohttp
from typing import List, Dict, Any

async def fetch_json(session: aiohttp.ClientSession, url: str) -> Dict[str, Any]:
    async with session.get(url) as response:
        return await response.json()

async def validate_hn_sort() -> str:
    base_url = "https://hacker-news.firebaseio.com/v0"
    async with aiohttp.ClientSession() as session:
        ids = await fetch_json(session, f"{base_url}/newstories.json")
        first_100_ids = ids[:100]
        tasks = [fetch_json(session, f"{base_url}/item/{item_id}.json") for item_id in first_100_ids]
        items = await asyncio.gather(*tasks)

        times = [item['time'] for item in items if item and 'time' in item]

        if len(times) < 100:
            return f"Insufficient data to verify: Expected 100 items, got {len(times)}."

        for i in range(1, len(times)):
            if times[i] > times[i - 1]:
                return f"Failure: Not sorted at index {i}. {times[i]} > {times[i-1]}"

        return "Success: First 100 articles are sorted from newest to oldest."

if __name__ == "__main__":
    result = asyncio.run(validate_hn_sort())
    print(result)
