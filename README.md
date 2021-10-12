# Setup
THE AAA top tier game for Bubba and Leah

Setup Steps:

1. install npm: ([NodeJS](https://nodejs.org/en/download/))
2. install meteor: `$ npm install -g meteor`
3. clone repository
4. Within repository directory, run initial meteor app setup: `$ meteor`
5. The final message should be:

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

# Quick FYI
Due to new browser security measures, the user is required to interact with a page before any audio can be played. As such, TTS in the starting screen (past the loading page) will not play until after you register a `mousedown` event on the page. 

*Because of this, we request that you please click somewhere on the screen during the loading page so that TTS fires at the appropriate time* :)


# Help
## Missing Packages
* when running `$ meteor` you may get notified for any extra packages you need to update. Please prepend `meteor ` to all of these commands.
* Ex: `npm install @babel/runtime` becomes `meteor npm install @babel/runtime`

## Meteor is not a Recognized Command
* If you get the following error or similar when running `$ meteor` - `meteor is not a recognized command`,
* On Mac: please make sure that the path your nodejs libraries are installed at is added to the paths file `/etc/paths`