const PINTEREST_API_BASE = "https://api.pinterest.com/v5";

function getToken(): string {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "PINTEREST_ACCESS_TOKEN is not set. See https://developers.pinterest.com/docs/getting-started/authentication/",
    );
  }
  return token;
}

async function pinterestFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${PINTEREST_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinterest API ${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export type PinterestBoard = {
  id: string;
  name: string;
  description?: string;
  privacy: "PUBLIC" | "PROTECTED" | "SECRET";
};

export type PinterestPin = {
  id: string;
  url: string;
  title?: string;
  link?: string;
  board_id?: string;
};

export async function listBoards(): Promise<PinterestBoard[]> {
  const data = await pinterestFetch<{ items: PinterestBoard[] }>("/boards?page_size=100");
  return data.items ?? [];
}

export async function createBoard(input: {
  name: string;
  description?: string;
  privacy?: "PUBLIC" | "PROTECTED" | "SECRET";
}): Promise<PinterestBoard> {
  return pinterestFetch<PinterestBoard>("/boards", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      description: input.description ?? "",
      privacy: input.privacy ?? "PUBLIC",
    }),
  });
}

export async function ensureBoard(name: string, description?: string): Promise<PinterestBoard> {
  const boards = await listBoards();
  const found = boards.find((b) => b.name.toLowerCase() === name.toLowerCase());
  if (found) return found;
  return createBoard({ name, description });
}

export async function createPin(input: {
  boardId: string;
  imageUrl: string;
  link: string;
  title: string;
  description: string;
  altText?: string;
}): Promise<PinterestPin> {
  return pinterestFetch<PinterestPin>("/pins", {
    method: "POST",
    body: JSON.stringify({
      board_id: input.boardId,
      link: input.link,
      title: input.title.slice(0, 100),
      description: input.description.slice(0, 800),
      alt_text: (input.altText ?? input.title).slice(0, 500),
      media_source: {
        source_type: "image_url",
        url: input.imageUrl,
      },
    }),
  });
}
