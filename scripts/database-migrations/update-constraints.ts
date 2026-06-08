import fs from 'fs';

function decodeHtml(html: string) {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function cleanConstraint(html: string) {
  let text = html.replace(/<sup>(.*?)<\/sup>/g, '^$1');
  text = text.replace(/<\/?[^>]+(>|$)/g, "");
  return decodeHtml(text).trim();
}

async function fetchConstraintsForSlug(slug: string): Promise<string[]> {
  const url = 'https://leetcode.com/graphql';
  const query = `query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { content } }`;
  const variables = { titleSlug: slug };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });

    const json = await res.json();
    const content = json?.data?.question?.content;

    if (!content) return [];

    const constraintsIdx = content.indexOf('Constraints');
    if (constraintsIdx === -1) return [];

    const afterConstraints = content.substring(constraintsIdx);
    const ulStart = afterConstraints.indexOf('<ul>');
    const ulEnd = afterConstraints.indexOf('</ul>');

    if (ulStart === -1 || ulEnd === -1) return [];

    const ulContent = afterConstraints.substring(ulStart + 4, ulEnd);
    const liRegex = /<li>(.*?)<\/li>/gs;
    let match;
    const constraints: string[] = [];

    while ((match = liRegex.exec(ulContent)) !== null) {
      constraints.push(cleanConstraint(match[1]));
    }

    return constraints;
  } catch (err) {
    console.error(`Failed to fetch for ${slug}`, err);
    return [];
  }
}


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

async function main() {
  console.log('Fetching all problems from Supabase using Anon Key...');

  const res = await fetch(`${supabaseUrl}/rest/v1/problems?select=id`, {
    headers: {
      'apikey': supabaseAnonKey!,
      'Authorization': `Bearer ${supabaseAnonKey!}`
    }
  });

  if (!res.ok) {
    console.error('Failed to fetch problems', await res.text());
    process.exit(1);
  }

  const problems = await res.json();
  console.log(`Found ${problems.length} problems. Fetching constraints...`);

  let sql = '';

  for (const problem of problems) {
    console.log(`Processing ${problem.id}...`);
    const constraints = await fetchConstraintsForSlug(problem.id);

    if (constraints.length > 0) {
      // Escape single quotes for SQL
      const constraintsArrayStr = `ARRAY[${constraints.map(c => `'${c.replace(/'/g, "''")}'`).join(', ')}]`;
      sql += `UPDATE public.problems SET constraints = ${constraintsArrayStr} WHERE id = '${problem.id}';\n`;
    }

    await new Promise(r => setTimeout(r, 500));
  }

  fs.writeFileSync('updates.sql', sql);
  console.log(`Finished. SQL written to updates.sql`);
}

main().catch(console.error);
