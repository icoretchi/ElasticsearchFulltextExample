﻿// Copyright (c) Philipp Wagner. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ElasticsearchFulltextExample.Web.Contracts
{
    public class DocumentDto
    {
        [FromForm(Name = "id")]
        public string Id { get; set; }

        [FromForm(Name = "title")]
        public string Title { get; set; }

        [FromForm(Name = "file")]
        public IFormFile File { get; set; }
    }
}
