const axios = require("axios");
const cheerio = require("cheerio");

const searchApiUrl = 'https://api.valueserp.com/search?api_key=C22335E236A043CDA181003BF5F1CE90&';
const appScriptUrl = 'https://script.google.com/macros/s/AKfycbzQr9V5f8MmrX9mqbMXTdtc14MVLqLA87RJby8t1ghSROvFbxKahA-ietSYV7WW_m8A/exec?';


const serialize = (obj) => {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

const search = async (query) => {
    const param = {
        location: "Germany",
        q: 'allintitle: ' + query
    }

    try {
		const response = await axios.get(searchApiUrl + serialize(param));
        return response.data;
	} catch (error) {
		throw error;
	}
}

const getQueries = async (sheetUrl, sheetName) => {
    const param = {
        action: 'get_queries',
        url: sheetUrl,
        sheet: sheetName
    }

    try {
		const response = await axios.get(appScriptUrl + serialize(param));
        return response;
	} catch (error) {
		throw error;
	}
}

const insertQueryResult = async (sheetUrl, sheetName, row, searchResult) => {
    const param = {
        action: 'insert_search_result',
        url: sheetUrl,
        sheet: sheetName,
        row: row,
        result: searchResult
    }

    try {
		const response = await axios.get(appScriptUrl + serialize(param));
        return response;
	} catch (error) {
		throw error;
	}
}

export { search, getQueries, insertQueryResult }