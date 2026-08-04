// assets/js/services/dataService.js

const cache = new Map();

export async function loadJSON(path) {

    if (cache.has(path)) {

        return cache.get(path);

    }

    const response = await fetch(path);

    if (!response.ok) {

        throw new Error(`Unable to load: ${path}`);

    }

    const data = await response.json();

    cache.set(path, data);

    return data;

}
