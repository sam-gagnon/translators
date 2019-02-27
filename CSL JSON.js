{
	"translatorID": "bc03b4fe-436d-4a1f-ba59-de4d2d7a63f7",
	"label": "CSL JSON",
	"creator": "Simon Kornblith",
	"target": "json",
	"minVersion": "4.0.27",
	"maxVersion": "",
	"priority": 100,
	"configOptions": {
		"async": true
	},
	"inRepository": true,
	"translatorType": 3,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-05 19:32:38"
}

function parseInput() {
	var str, json = "";
	
	// Read in the whole file at once, since we can't easily parse a JSON stream. The 
	// chunk size here is pretty arbitrary, although larger chunk sizes may be marginally
	// faster. We set it to 1MB.
	while ((str = Z.read(1048576)) !== false) json += str;
	
	try {
		return JSON.parse(json);
	} catch(e) {
		Zotero.debug(e);
	}
}

function detectImport() {
	const CSL_TYPES = {"book":true,"chapter":true,"article-journal":true,"article-magazine":true,
					   "article-newspaper":true,"thesis":true,"entry-encyclopedia":true,
					   "entry-dictionary":true,"paper-conference":true,"personal_communication":true,
					   "manuscript":true,"interview":true,"motion_picture":true,"graphic":true,
					   "webpage":true,"report":true,"bill":true,"legal_case":true,"hearing":true,
					   "patent":true,"legislation":true,"map":true,"post-weblog":true,"post":true,
					   "song":true,"speech":true,"video":true,"broadcast":true,"gazette":true,
					   "regulation":true,"classic":true,"treaty":true,"standard":true,
					   "article":true};

	var parsedData = parseInput();
	if (!parsedData) return false;
	
	if (typeof parsedData !== "object") return false;
	if (!(parsedData instanceof Array)) parsedData = [parsedData];
	
	for (var i=0; i<parsedData.length; i++) {
		var item = parsedData[i];
		if (typeof item !== "object" || !item.type || !(item.type in CSL_TYPES)) {
			return false;
		}
	}
	return true;
}

function doImport() {
	if (typeof Promise == 'undefined') {
		startImport(
			function () {},
			function (e) {
				throw e;
			}
		);
	}
	else {
		return new Promise(function (resolve, reject) {
			startImport(resolve, reject);
		});
	}
}

function startImport(resolve, reject) {
	try {
		var parsedData = parseInput();
		if (!parsedData) resolve();
		if (!Array.isArray(parsedData)) parsedData = [parsedData];
		importNext(parsedData, resolve, reject);
	}
	catch (e) {
		reject (e);
	}
}

function importNext(data, resolve, reject) {
	try {
		var d;
		while (d = data.shift()) {
			var item = new Z.Item();
			ZU.itemFromCSLJSON(item, d);
			var maybePromise = item.complete();
			if (maybePromise) {
				maybePromise.then(function () {
					importNext(data, resolve, reject);
				});
				return;
			}
		}
	}
	catch (e) {
		reject(e);
	}
	
	resolve();
}

function doExport() {
	var item, data = [];
	while (item = Z.nextItem()) data.push(ZU.itemToCSLJSON(item));
	Z.write(JSON.stringify(data, null, "\t"));
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "import",
		"input": "[\n\t{\n\t\t\"id\": \"http://zotero.org/users/96641/items/BDQRTS3T\",\n\t\t\"type\": \"book\",\n\t\t\"title\": \"Stochastic biomathematical models: With applications to neuronal modeling\",\n\t\t\"collection-title\": \"Lecture notes in mathematics\",\n\t\t\"publisher\": \"Springer\",\n\t\t\"publisher-place\": \"Heidelberg\",\n\t\t\"volume\": \"2058\",\n\t\t\"number-of-pages\": \"206\",\n\t\t\"event-place\": \"Heidelberg\",\n\t\t\"ISBN\": \"978-3-642-32156-6\",\n\t\t\"language\": \"en\",\n\t\t\"author\": [\n\t\t\t{\n\t\t\t\t\"family\": \"Bachar\",\n\t\t\t\t\"given\": \"Mostafa\"\n\t\t\t}\n\t\t],\n\t\t\"issued\": {\n\t\t\t\"date-parts\": [\n\t\t\t\t[\n\t\t\t\t\t\"2013\",\n\t\t\t\t\t1,\n\t\t\t\t\t1\n\t\t\t\t]\n\t\t\t]\n\t\t}\n\t}\n]",
		"items": [
			{
				"itemType": "book",
				"title": "Stochastic biomathematical models: With applications to neuronal modeling",
				"creators": [
					{
						"lastName": "Bachar",
						"firstName": "Mostafa",
						"creatorType": "author"
					}
				],
				"date": "January 1, 2013",
				"ISBN": "978-3-642-32156-6",
				"itemID": "http://zotero.org/users/96641/items/BDQRTS3T",
				"language": "en",
				"numPages": "206",
				"place": "Heidelberg",
				"publisher": "Springer",
				"series": "Lecture notes in mathematics",
				"volume": "2058",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
