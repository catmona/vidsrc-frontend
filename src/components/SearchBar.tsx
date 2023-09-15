import { useEffect, useRef, useState } from 'react';
import { Video } from '../globals';

interface props {
    setMovieResults: (videos: Video[]) => void;
    setTVResults: (videos: Video[]) => void;
}

interface ISearchResults {
    results: ISearchResult[];
}

interface ISearchResult {
    id: string;
    name: string;
    title: string;
    poster_path: string;
    backdrop_path: string;
}

export default function SearchBar(props: props) {
    const { setMovieResults, setTVResults } = props;
    const [query, setQuery] = useState('');
    const timer = useRef<NodeJS.Timeout>();
    const SEARCH_TIMER = 200;
    const TMDB_KEY = import.meta.env.VITE_TMDB_KEY as string;

    useEffect(() => {
        //wait for SEARCH_TIMER milliseconds of inactivity
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            search.bind(window);
        }, SEARCH_TIMER);
    }, [query]);

    async function search() {
        setMovieResults(await getResults('movie'));
        setTVResults(await getResults('tv'));
    }

    async function getResults(type: string): Promise<Video[]> {
        //get results from api
        const url =
            'https://api.themoviedb.org/3/search/' + type + '?include_adult=false&language=en-US&page=1' + '&query=' + query.replace(/ /g, '+');
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer ' + TMDB_KEY,
            },
        };

        const res = await fetch(url, options);
        const results = (await res.json()) as ISearchResults;
        console.log(results);

        //convert to standard format
        let formatted: Video[] = [];
        for (const unformatted of results.results) {
            formatted = [format(unformatted, type), ...formatted];
        }

        return formatted;
    }

    function format(unformatted: ISearchResult, type: string): Video {
        const video: Video = {
            tmdb_id: unformatted.id,
            imdb_id: '',
            title: '',
            poster_path: unformatted.poster_path,
            backdrop_path: unformatted.poster_path,
            type: type,
        };

        if (type == 'tv') {
            video.title = unformatted.name;
        } else {
            video.title = unformatted.title;
        }

        return video;
    }

    return (
        <form className="w-full pl-{15%} pr-{15%}">
            <div className="w-full border border-green-300 bg-red-300 p-1 text-lg font-bold text-yellow-200 shadow placeholder:text-orange-200">
                <input
                    className=""
                    type="text"
                    placeholder="Search..."
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onSubmit={(e) => {
                        e.preventDefault();
                        void search();
                    }}
                />
                <label>
                    <input type="submit" className="mr-1 mt-1 hidden cursor-pointer content-none hover:text-blue-200" />
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                    </svg>
                </label>
            </div>
        </form>
    );
}