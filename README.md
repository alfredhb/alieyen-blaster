# Setup
THE AAA top tier game for Bubba and Leah

Setup Steps:

1. install npm: ([NodeJS](https://nodejs.org/en/download/))
2. install meteor: `$ npm install -g meteor`
    * **Note:** Users have reported issues with installing meteor through npm. If this occurs, please use the [legacy installation instructions](https://docs.meteor.com/install.html#legacy-install).
3. clone repository
4. Connect to development database. Please contact devs for mongo uri
    * MacOS/Linux, run the following command and skip step 5.
        ```
        $ MONGO_URL=<mongourl> meteor
        ```
    * Windows. run the following command and continue to step 5.
        ```
        $ set MONGO_URL=<mongourl>
        ```
5. Within repository directory, run initial meteor app setup: `$ meteor`
6. The final message should be:

    ```
    $ meteor
    [[[[[ <Path to Repository>\alieyen-blaster ]]]]]

    ....

    => Started proxy.
    => Started HMR server.
    => Started MongoDB.
    => Started your app.

    => App running at: http://localhost:3000/
    Type Control-C twice to stop.
   ```
   You can access the website at `localhost:3000` to play the game!

# Running After Setup
The above setup details how to install all required components and connect the MongoDB for a first time run. It's important to note that the MongoDB URL should be connected before each subsequent run of the server in a new terminal. As such, your command for running the server in the dev environment would be:

MacOS/Linux
```
$ MONGO_URL=<mongourl> meteor
```
Windows
```
$ set MONGO_URL=<mongourl>
```

Optional `Run` scripts are provided per OS which you can use at your disgretion.

**Note:** You must also update the scripts with the provided MongoURL for them to work. 

Filenames: `run.bat` and `run.sh`

# Quick FYI
Due to new browser security measures, the user is required to interact with a page before any audio can be played. As such, TTS in the starting screen (past the loading page) will not play until after you register a `mousedown` event on the page. 

*Because of this, we request that you please click somewhere on the screen during the loading page so that TTS fires at the appropriate time* :)


# Help
## Missing Packages
* when running `$ meteor` you may get notified for any extra packages you need to update. Please prepend `meteor ` to all of these commands.
* Ex: `npm install @babel/runtime` becomes `meteor npm install @babel/runtime`

## Meteor is not a Recognized Command
* If you get the following error or similar when running `$ meteor`
    ```
    $  'meteor' is not recognized as an internal or external command,
    operable program or batch file.
    ```
* On Mac: please make sure that the path your nodejs libraries are installed at (`npm root -g`) is added to the paths file `/etc/paths`
* On Windows: please reinstall nodejs and assert that it adds the correct paths when you install meteor. If this doesn't work, please try cloning the repo on a CAEN computer.
