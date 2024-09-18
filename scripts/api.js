import {Octokit, App} from "https://esm.sh/octokit";

async function fetchRepo(repo,apiKey) {
    if (apiKey) {
        // Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
        const octokit = new Octokit({auth: apiKey});

        // Compare: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
        const {
            data: {login},
        } = await octokit.rest.users.getAuthenticated();

        // https://docs.github.com/en/rest/reference/issues#create-an-issue
        const apiRepo = await octokit.request("GET /repos/"+login+"/"+repo+"/commits", {
            username: login,
            api_key: apiKey,
        });

        document.getElementById("button").onclick = () => {
            ghFetchTime(JSON.stringify(apiRepo), repo)
        }
    } else {
        const octokit = new Octokit();
        const login = document.getElementById("user").value;

        const apiRepo = await octokit.request("GET /repos/"+login+"/"+repo+"/commits", {
            username: login,
        });

        document.getElementById("button").onclick = () => {
            ghFetchTime(JSON.stringify(apiRepo), repo)
        }
    }
}

let apiRepos;
async function fetchRepos(apiKey) {
    if (apiKey) {
        const octokit = new Octokit({auth: apiKey});

        const {
            data: {login},
        } = await octokit.rest.users.getAuthenticated();

        apiRepos = await octokit.request("GET /users/"+login+"/repos", {
            username: login,
            api_key: apiKey,
        });
    } else {
        const octokit = new Octokit();
        const login = document.getElementById("user").value;

        apiRepos = await octokit.request("GET /users/"+login+"/repos", {
            username: login,
        });
    }

    document.getElementById("repo").innerHTML = "<option value=\"\">-Select a repo-</option>";
    for (let i = 0; i < apiRepos.data.length; i++) {
        let el = document.createElement("option");
        el.innerHTML = apiRepos.data[i].name;
        el.value = apiRepos.data[i].name;
        document.getElementById("repo").appendChild(el);
    }
}

document.getElementById("user").onblur = () => {
    fetch("api_key.txt")
        .then( r => {
            if(r.ok) {
                r.text();
            } else {
                return;
            }
        })
        .then( t => fetchRepos(t))
}