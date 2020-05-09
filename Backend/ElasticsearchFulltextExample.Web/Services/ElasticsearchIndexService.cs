﻿// Copyright (c) Philipp Wagner. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using ElasticsearchFulltextExample.Web.Database.Model;
using ElasticsearchFulltextExample.Web.Elasticsearch;
using ElasticsearchFulltextExample.Web.Elasticsearch.Model;
using Nest;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ElasticsearchFulltextExample.Web.Services
{
    public class ElasticsearchIndexService
    {
        private readonly TesseractService tesseractService;
        private readonly ElasticsearchClient elasticsearchClient;

        public ElasticsearchIndexService(ElasticsearchClient elasticsearchClient, TesseractService tesseractService)
        {
            this.elasticsearchClient = elasticsearchClient;
            this.tesseractService = tesseractService;
        }

        public async Task<IndexResponse> IndexDocumentAsync(Document document, CancellationToken cancellationToken) {
            
            return await elasticsearchClient.IndexAsync(new ElasticsearchDocument
            {
                Id = document.DocumentId,
                Title = document.Title,
                Filename = document.Filename,
                Suggestions = document.Suggestions,
                Keywords = document.Suggestions,
                Data = document.Data,
                Ocr = await GetOcrDataAsync(document),
                IndexedOn = DateTime.UtcNow,
            });
        }
    

        private async Task<string> GetOcrDataAsync(Document document)
        {
            if(!document.IsOcrRequested)
            {
                return string.Empty;
            }

            return await tesseractService.ProcessDocument(document.Data, "eng").ConfigureAwait(false);
        }


    }
}