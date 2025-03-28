/**
 * Run this on https://dev.twitch.tv/docs/authentication/scopes/ to get all the scopes
 */

function getScopes() {
    let lTables = [...document.querySelectorAll("table>tbody>tr")];
    let lObject = {};

    lTables.forEach((pElem) => {
        var lData = [...pElem.getElementsByTagName("td")];
        lObject[lData[0].innerText] = lData[1].innerHTML.replaceAll('href="/', 'href="https://dev.twitch.tv/');
    });

    console.log((lObject));
}

getScopes();