// assets/js/services/dataService.js

const cache = new Map();

export async function getJSON(file) {

    if (cache.has(file)) {

        return cache.get(file);

    }

    const response = await fetch(`/data/${file}`);

    if (!response.ok) {

        throw new Error(`Cannot load ${file}`);

    }

    const data = await response.json();

    cache.set(file, data);

    return data;

}
