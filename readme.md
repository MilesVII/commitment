# Commitment
GitHub contribution graph drawing utility with UI

## Usage

**[Available at https://commitment.pages.dev/](https://commitment.milesseventh.workers.dev/)**

- Enter your github profile name into the field
- Click "fetch"
- Once data is fetched, a grid resembling GitHub contribution graph will be shown
- Draw on cells by picking current color from palette below and adjusting scale with the slider
- Once ready, click "generate"
- Click appeared link to download script file
- Run generated file under local git repository
- Push the repo to your GitHub remote

## Notes

Even though you can see your private contributions in the graph, they are hidden for other users, so the repo you push commits to has to be be public. The tool fetches only publicly available contributions.

### Claude:
> [!NOTE]
> GitHub does not use fixed commit counts for the shades of green: the cutoffs are computed per user, relative to their own activity (roughly, the busiest day of the year after dropping a few outliers is split into quarters). The tool scrapes the real contribution counts along with the colors and derives the cutoffs from them, they are shown under the palette after fetching. Keep in mind:
>
> - The cutoffs are relative, so the drawing itself can move them. If the graph is empty or nearly empty, a drawing using a single shade will show up as the darkest shade, as there is nothing to compare it against. Using several shades (and ideally some darkest cells) keeps the scale anchored.
> - The outlier rule GitHub uses is not public, so the busiest days may count or not count towards the scale after your commits are pushed. Colors may still differ slightly in such cases.

## Alternatives

There are alternative projects that do similar job, [@blaise-io/contribution](https://github.com/blaise-io/contribution) is one of them.

However, I didn't manage to find a single one that would provide a convenient UI that accounts for aligning drawings with existing contributions.

## License
Shared under WTFPL license.