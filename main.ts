interface HNItem {
    id: number;
    time: number;
    title?: string;
}

async function validateHackerNewsSort(): Promise<string> {
    const baseUrl = "https://hacker-news.firebaseio.com/v0";

    try {
        const idsResponse = await fetch(`${baseUrl}/newstories.json`);
        const ids: number[] = await idsResponse.json();
        const first100Ids = ids.slice(0, 100);

        const itemPromises = first100Ids.map(id =>
            fetch(`${baseUrl}/item/${id}.json`).then(res => res.json() as Promise<HNItem>)
        );

        const items: HNItem[] = await Promise.all(itemPromises);
        const times: number[] = items.map(item => item.time).filter(time => time !== undefined);

        if (times.length !== 100) {
            return `Insufficient data to verify: Expected 100 timestamps, retrieved ${times.length}.`;
        }

        for (let i = 1; i < times.length; i++) {
            if (times[i] > times[i - 1]) {
                return `Failure: Sort order violated at index ${i}. Timestamp ${times[i]} > ${times[i - 1]}.`;
            }
        }

        return "Success: First 100 articles are sorted from newest to oldest.";
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error executing validation: ${errorMessage}`;
    }
}

validateHackerNewsSort().then(console.log).catch(console.error);
