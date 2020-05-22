import React, { useState, useEffect } from "react";
import "./ResultsPage.css";
import Error from "../components/Error";
// import PieGraph from "./Graphs/PieGraph";
import { apiErrorList, errorList } from "./Config/ErrorList";
// import UserData from "./UserData";
import { useHistory } from "react-router-dom";
// import BarGraph from "./Graphs/BarGraph";
import UserData from "./UserData";

// 1. Check if the incoming props and username data has value.
// 2. Make API call if user data is null and username is not empty.
// 3. Display userdata if both username and data is avaialble
// 4. Else display error page

function Homepage(props) {
  const history = useHistory();
  const [languageData, setLanguageData] = useState(null);
  const [starredData, setStarredData] = useState(null);
  const [repoList, setRepoList] = useState(null);
  const [userData, setUserData] = useState({
    data: null,
    error: null,
  });

  useEffect(() => {
    if (userData.error) {
      setTimeout(function () {
        history.push("/");
      }, 3000);
    }
  });

  // Loop over all the repos and calculate how often a language is used.
  const getUserRepositories = (url) => {
    fetch(url)
      .then((data) => data.json())
      .then((data) => {
        setRepoList(data);
        return data;
      })
      .then((data) => {
        // Get language and starred data
        let languageDataMap = new Map();
        let starredDataMap = new Map();

        for (let i = 0; i < data.length; i++) {
          let language = data[i].language;
          let starredCount = data[i].stargazers_count;
          let repoName = data[i].name;

          // Language cannot be null / empty
          if (language && language.trim() !== "") {
            if (languageDataMap.has(language)) {
              let currentCount = languageDataMap.get(language);
              languageDataMap.set(language, currentCount + 1);
            } else {
              languageDataMap.set(language, 1);
            }
          }
          // get starred data
          if (
            starredCount !== null &&
            starredCount !== undefined &&
            repoName != null &&
            repoName !== undefined
          ) {
            starredDataMap.set(repoName, starredCount);
          }
        }
        const sortedLanguageData = new Map(
          [...languageDataMap.entries()].sort((a, b) => b[1] - a[1])
        );

        const sortedStarredMap = new Map(
          [...starredDataMap.entries()].sort((a, b) => b[1] - a[1])
        );
        setStarredData(sortedStarredMap);
        setLanguageData(sortedLanguageData);
      });
  };

  // This method will retrieve both basic user data and repo data--
  const retrieveBasicUserData = (usernameFieldValue) => {
    let responseObject = {
      data: null,
      error: null,
    };

    fetch(`https://api.github.com/users/${usernameFieldValue}`)
      .then((response) => {
        return response.json().then((data) => {
          if (response.status === 200) {
            responseObject.data = data;
          }
          // 404 and 403 errors
          else if (response.status in apiErrorList) {
            responseObject.error = apiErrorList[response.status];
          }
          // default error if response not ok and not in error list
          else {
            responseObject.error = errorList.GENERAL_ERROR;
          }
        });
      })
      .then(() => {
        setUserData(responseObject);
        if (responseObject.data !== null) {
          getUserRepositories(responseObject.data.repos_url);
        }
      })
      .catch(() => {
        responseObject.error = apiErrorList[0];
        setUserData(responseObject);
      });
  };

  useEffect(() => {
    // get username from query parameter
    let responseObject = null;
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");

    // Set incoming data using setUserData and call API to retrieve repolist
    if (props.userData && username && username.trim() !== "") {
      setUserData(props.userData);
      // get Repo data
      let repoUrl = props.userData.data.repos_url;
      if (repoUrl != null && repoUrl.trim() !== "") {
        getUserRepositories(props.userData.data.repos_url);
      }
    } else if (
      props.userData === null &&
      username !== null &&
      username.trim() !== ""
    ) {
      retrieveBasicUserData(username);
    } else {
      setUserData({ data: null, error: errorList.GENERAL_ERROR });
    }
  }, []);

  return (
    <div className="MainResultPageContainer">
      {userData.error && <Error error={userData.error} />}

      {userData.data && (
        <React.Fragment>
          <UserData userData={userData.data} />
        </React.Fragment>
      )}
      {/* {userData !== null && languageData !== null && starredData !== null && ( */}
      {/* // <React.Fragment> */}
      {/* <UserData userData={userData} /> 
      {/* <PieGraph languageData={languageData} /> */}
      {/* <BarGraph starredData={starredData} /> */}
      {/* </React.Fragment> */}
      {/* )} */}
      {/* {starredData !== null && <BarGraph starredData={starredData} />} */}
    </div>
  );
}

export default Homepage;
