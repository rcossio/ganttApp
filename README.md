# GanttApp

I made this because Click*p charges 7 USD if you see your tasks in a Gantt chart too many times, even as a single user.

## Future Improvements
- Fix: Not reading teams from config. Problem may be in saveConfig()
- Feat: Add an assigned person per task.
- TODO: saveConfig({ groups: state.groups, zoomLevel: state.zoomLevel, team: state.team }); should be more compact. When renaming a group it saves just a piece of the config, not the whole thing.
- Feat: Add a delete button for the team when doing a right click, with a popup sign
- Feat: Mark the current day in the timeline
-  Feat: dragging groups and task to reorder them 
- Feat: Right click to the block of task to remove the dates
- Feat: Drag task block horizontally
- Feat: the vertical scroll should not move the header


