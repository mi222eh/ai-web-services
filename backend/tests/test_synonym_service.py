import pytest
from unittest.mock import patch, MagicMock
from server.services.synonym_service.ai import (
    search_parallel,
    generate_results_parallel,
    create_synonym_ai,
    create_and_validate_synonym,
    CreateSynonymSchema,
    RankingSchema,
    SearchQueriesSchema,
)


@pytest.fixture
def mock_ddgs():
    with patch("server.services.synonym_service.ai.DDGS") as mock:
        ddgs_instance = MagicMock()
        # Make sure text method returns iterator
        ddgs_instance.text = MagicMock(return_value=iter([]))
        mock.return_value.__enter__.return_value = ddgs_instance
        yield ddgs_instance


@pytest.fixture
def mock_ollama_client():
    with patch("server.services.synonym_service.ai.client") as mock:
        yield mock


def test_search_parallel_success(mock_ddgs):
    # Setup mock response
    mock_results = [
        {"title": "Test1", "link": "http://test1.com", "body": "Test body 1"},
        {"title": "Test2", "link": "http://test2.com", "body": "Test body 2"},
    ]
    # Make text return iterator for each call
    mock_ddgs.text.side_effect = [iter(mock_results), iter(mock_results)]

    # Test parallel search
    queries = ["test query 1", "test query 2"]
    results = search_parallel(queries, max_results=2)

    # Verify results
    assert len(results) == 4  # 2 results per query
    assert mock_ddgs.text.call_count == 2
    mock_ddgs.text.assert_any_call("test query 1", max_results=2)
    mock_ddgs.text.assert_any_call("test query 2", max_results=2)


def test_search_parallel_error(mock_ddgs):
    # Setup mock to raise exception
    mock_ddgs.text.side_effect = Exception("Search failed")

    # Test parallel search with error
    queries = ["test query 1", "test query 2"]
    results = search_parallel(queries)

    # Verify empty results on error
    assert results == []
    assert mock_ddgs.text.call_count == 2


def test_generate_results_parallel(mock_ollama_client):
    # Setup mock responses
    mock_response = MagicMock()
    mock_response.message.content = (
        '{"word": "test", "synonyms": ["test1", "test2"], "explanation": "A test word"}'
    )
    mock_response.message.tool_calls = []

    mock_ollama_client.chat.return_value = mock_response

    # Test parallel generation
    results = generate_results_parallel("test", "test search info", num_results=3)

    # Verify results
    assert len(results) == 3
    for result in results:
        assert isinstance(result, CreateSynonymSchema)
        assert result.word == "test"
        assert result.synonyms == ["test1", "test2"]
        assert result.explanation == "A test word"

    # Verify chat was called multiple times
    assert mock_ollama_client.chat.call_count == 3


def test_create_synonym_ai_success(mock_ollama_client):
    # Setup mock responses
    mock_response = MagicMock()
    mock_response.message.content = (
        '{"word": "test", "synonyms": ["test1", "test2"], "explanation": "A test word"}'
    )
    mock_response.message.tool_calls = []

    mock_ollama_client.chat.return_value = mock_response

    # Test create synonym with provided search info
    result = create_synonym_ai("test", search_info="Test search results")

    # Verify result
    assert isinstance(result, CreateSynonymSchema)
    assert result.word == "test"
    assert result.synonyms == ["test1", "test2"]
    assert result.explanation == "A test word"


def test_create_and_validate_synonym_success(mock_ollama_client, mock_ddgs):
    # Setup mock responses for search queries
    mock_query_response = MagicMock()
    mock_query_response.message.content = '{"queries": ["query1", "query2", "query3"]}'

    # Setup mock responses for create_synonym_ai
    mock_synonym_response = MagicMock()
    mock_synonym_response.message.content = (
        '{"word": "test", "synonyms": ["test1"], "explanation": "Test explanation"}'
    )
    mock_synonym_response.message.tool_calls = []

    # Setup mock response for ranking
    mock_ranking_response = MagicMock()
    mock_ranking_response.message.content = (
        '{"rankings": [{"index": "1", "rank": 1, "motivation": "Best"}, '
        '{"index": "2", "rank": 2, "motivation": "Good"}, '
        '{"index": "3", "rank": 3, "motivation": "OK"}]}'
    )

    # Setup search results to return iterator
    mock_results = [{"title": "Test", "body": "Test body"}]
    mock_ddgs.text.return_value = iter(mock_results)

    # Setup response sequence
    mock_ollama_client.chat.side_effect = [
        mock_query_response,  # For search queries
        mock_synonym_response,  # For result 1
        mock_synonym_response,  # For result 2
        mock_synonym_response,  # For result 3
        mock_synonym_response,  # For result 4
        mock_synonym_response,  # For result 5
        mock_ranking_response,  # For ranking
    ]

    # Test create and validate
    result = create_and_validate_synonym("test")

    # Verify result
    assert isinstance(result, CreateSynonymSchema)
    assert result.word == "test"
    assert result.synonyms == ["test1"]
    assert result.explanation == "Test explanation"

    # Verify search was called at least once
    assert mock_ddgs.text.call_count > 0


def test_create_and_validate_synonym_no_results(mock_ollama_client, mock_ddgs):
    # Setup mock for search queries
    mock_query_response = MagicMock()
    mock_query_response.message.content = '{"queries": ["query1"]}'

    # Setup mock to return None for all create_synonym_ai calls
    mock_response = MagicMock()
    mock_response.message.content = "Invalid JSON"
    mock_response.message.tool_calls = []

    # Setup response sequence
    mock_ollama_client.chat.side_effect = [
        mock_query_response,  # For search queries
        mock_response,  # For all generate attempts
        mock_response,
        mock_response,
        mock_response,
        mock_response,
    ]

    # Setup empty search results
    mock_ddgs.text.return_value = []

    # Test create and validate with no valid results
    with pytest.raises(Exception, match="Failed to generate synonym results"):
        create_and_validate_synonym("test")
