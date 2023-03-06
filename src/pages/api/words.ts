// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const search = req.query.search;
	const result = await fetch(
		`https://dictionary.cambridge.org/ru/autocomplete/amp?dataset=english&q=${search}&__amp_source_origin=https%3A%2F%2Fdictionary.cambridge.org`
	);
	const json = await result.json();
	res.status(200).json(json);
}
