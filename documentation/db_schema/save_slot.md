# Save Slot Entries will consist of the following attributes

```
{
    _id: string,                //slot name: slot1 etc
    level: [
        {
            name: string,
            complete: boolean
        }
        ...
    ],
    difficulty: number
}

```