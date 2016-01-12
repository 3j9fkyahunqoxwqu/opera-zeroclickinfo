/*
 * Copyright (C) 2012 DuckDuckGo, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


function Background()
{
    $this = this;

    // clearing last search on borwser startup
    localStorage['last_search'] = '';

    chrome.extension.onMessage.addListener(function(request, sender, callback){
        console.log(request);
        if(request.query)
            return $this.query(request.query, callback);
        if (request.options) {
            callback(localStorage);
        }

        if (request.selection) {
        
        }

        if (request.current_url) {
            chrome.tabs.getSelected(function(tab) {
                console.log(tab);
                var url = tab.url;
                callback(url);
            });
        }

        return true;
    });

//  this.menuID = chrome.contextMenus.create({
//       "title" : "Ask the duck",
//       "type" : "normal",
//       "contexts" : ["selection"],
//       "onclick" : function() {
//          console.log('clicked!!!'); 
//       }
//  });
}

Background.prototype.query = function(query, callback) 
{
    console.log('got a query', query);
    var req = new XMLHttpRequest();
    console.log(localStorage['zeroclickinfo']);
    if (localStorage['zeroclickinfo'] === 'false') {
        callback(null);
        return;
    } else {
        req.open('GET', 'https://chrome.duckduckgo.com?q=' + encodeURIComponent(query) + '&format=json&d=1', true);
    }

    req.onreadystatechange = function(data) {
        if (req.readyState != 4)  { return; } 
        var res = JSON.parse(req.responseText);
        console.log('res:', res);
        callback(res);
    }

    req.send(null);
    return true;
}

var background = new Background();

chrome.omnibox.onInputEntered.addListener( function(text) {
    chrome.tabs.query({'currentWindow': true, 'active': true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: "https://duckduckgo.com/?q="+encodeURIComponent(text)});
    });
});
