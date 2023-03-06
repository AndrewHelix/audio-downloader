import {
	Box,
	Button,
	TextField,
	Autocomplete,
	Typography,
	Grid,
} from '@mui/material';
import { FormEvent, useEffect, useRef, useState } from 'react';

interface Suggestion {
	word: string;
	url: string;
	beta: boolean;
}

interface AudioData {
	title: string;
	link: string;
}

export default function Home() {
	const [searchValue, setSearchValue] = useState<string>('');
	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
	const [audioData, setAudioData] = useState<AudioData[]>([]);
	const [isNotFound, setIsNotFound] = useState<boolean>(false);
	const timeoutId = useRef(0);

	useEffect(() => {
		clearTimeout(timeoutId.current);
		setIsNotFound(false);
		if (searchValue) {
			timeoutId.current = window.setTimeout(getWords, 300);
		} else {
			setSuggestions([]);
			setAudioData([]);
		}
	}, [searchValue, setSuggestions]);

	const getWords = async () => {
		const res = await fetch(
			'/api/words?search=' + searchValue
		);
		const json = await res.json();
		setSuggestions(json);
	};

	const searchHandler = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const res = await fetch(
			'/api/search?word=' + searchValue
		);
		let html = await res.json();
		html = html.trim();
		parseDom(html);
	};

	const parseDom = (html: string) => {
		const parser = new DOMParser();
		const doc = parser
			.parseFromString(html, 'text/html')
			.getElementById('page-content');
		if (!doc) {
			setIsNotFound(true);
			return;
		}

		const audios = [...doc.getElementsByTagName('audio')].slice(0, 2);
		const titles = audios.reduce<(string | null)[]>((acc, audioNode) => {
			const nextElement = audioNode.nextElementSibling;
			if (nextElement) {
				acc.push(nextElement?.getAttribute('title'));
			}
			return acc;
		}, []);
		const audioLinks = audios.map((audio) => {
			const source = audio.querySelector('source[src$=".mp3"]');
			const link = source?.getAttribute('src');
			return 'https://dictionary.cambridge.org' + link;
		});

		const audioData = audioLinks.reduce<AudioData[]>((acc, link, index) => {
			const data: AudioData = { link: '', title: '' };
			data['link'] = link;
			data['title'] = titles[index] || '';
			acc.push(data);
			return acc;
		}, []);

		setAudioData(audioData);
	};
	return (
		<Box
			sx={{
				height: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column',
				gap: '3rem',
			}}
		>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: '2rem',
				}}
			>
				<Grid
					onSubmit={searchHandler}
					component="form"
					sx={{ display: 'flex', gap: '2rem' }}
				>
					<Autocomplete
						sx={{ width: 300 }}
						freeSolo
						id="free-solo-2-demo"
						disableClearable
						options={suggestions.map((option) => option.word)}
						inputValue={searchValue}
						onInputChange={(_, value) => setSearchValue(value)}
						renderInput={(params) => (
							<TextField
								{...params}
								fullWidth
								label="Search input"
								InputProps={{
									...params.InputProps,
									type: 'search',
								}}
							/>
						)}
					/>
					<Button variant="outlined" type="submit">
						Search
					</Button>
				</Grid>
			</Box>
			<Box sx={{ display: 'flex', gap: '2rem' }}>
				{searchValue && isNotFound ? (
					<Typography>Похоже такого слова нет 😥</Typography>
				) : (
					audioData.map((element) => (
						<Box
							key={element.link}
							sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
							}}
						>
							<Typography>{element.title}</Typography>
							<audio controls src={element.link}></audio>
						</Box>
					))
				)}
			</Box>
		</Box>
	);
}
