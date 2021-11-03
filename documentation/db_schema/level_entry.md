# Level Entries will consist of the following typed attributes

```
{
    _id: string,                        //level name *or* scene name
    level: {
        difficulty_multiplier: num,
        objective: ENUM,                //TIMED, LIVES, TIMEKILLS, LIVEKILLS, TIMELIVES
        win_cond: {
            lives: num,
            time: num,                  //in seconds
            kills: {
                grunt: num,
                mini_boss: num,
                boss: num
            },
            powerups: false *or* [
                {
                    name: string,
                    enabled: boolean
                },
                ...
            ],
        }
        aliens: {
            grunt: {
                spawn: boolean,
                quantity: num,
                score: num              //associated score per kill
            },
            mini_boss: {
                spawn: boolean,
                quantity: num,
                score: num
            },
            boss: {
                spawn: boolean,
                quantity: num,
                score: num
            }
        }   
    },
    assets: {
        hud: string,
        turret: string,
        background: string
    },
    scene: {
        type: ENUM                      //ARCADE, STORY
        cutscene: {
            open: string,               //Hardcoded scene names
            close: string           
        },
        previous: {
            name: string,
            type: ENUM
        },
        next: {
            name: string,
            type: ENUM
        },
        report: string                  //scene name of report card to show
    }
}
```
