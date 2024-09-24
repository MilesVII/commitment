# Commitment
GitHub contribution graph drawing utility with UI

## Usage

**[Available at https://commitment.pages.dev/]([https://github.com/MilesVII/arstotzka/blob/master/usage.js](https://commitment.pages.dev/))**

- Enter your github profile name into the field
- Click "fetch"
- Once data is fetched, a grid resembling GitHub will be shown
- Draw on cells by picking current color from palette below and adjusting scale with the slider
- Once ready, click "generate"
- Click appeared link to download `.bat` file
- Run generated batch file under local git repository
- Push the repo to your GitHub remote

## Notes

Even though you can see your private contributions in the graph, they are hidden for other users, so the repo you push commits to has to be be public. The tool fetches only publicly available contributions.

## Alternatives

There are alternative projects that do similar job, [@blaise-io/contribution](https://github.com/blaise-io/contribution) is one of them.

However, I didn't manage to find a single one that would provide a convenient UI that accounts for aligning drawings with existing contributions.

## License
Shared under WTFPL license.
