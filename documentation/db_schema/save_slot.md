# Save Slot Entries will consist of the following attributes

```
{
    _id: string,                //slot name: slot1 etc
    level: [
        {
            name: string,
            complete: boolean,
            stars: number       // number of stars if complete is true [1, 3]
        }
        ...
    ],
    difficulty: number
}

```