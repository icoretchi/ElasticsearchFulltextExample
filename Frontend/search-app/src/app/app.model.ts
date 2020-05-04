export interface SearchResults {
  query: string;
  results: SearchResult[];
}

export interface SearchResult {
  identifier: string;
  title: string;
  matches: string[];
  keywords: string[];
  url: string;
  type: string;
}

export interface SearchSuggestions {
  query: string;
  results: SearchSuggestion[];
}

export interface SearchSuggestion {
  text: string;
  highlight: string;
}