# GanttApp

I made this because Click*p charges 7 USD if you see your tasks in a Gantt chart too many times, even as a single user.

## Notes
- Fix: Left & Right clicking in the timeline will add a task at that position. Only right click should do that.
- Fix: Once the time block has been set, clicking in another position should not change the start/end time of the task.
- Feat: The timeline should be scrollable horizontally by dragging the empty space at the bottom.
- Feat: the render module attatched events to all three buttons for groups/tasks, it is better to have a function per component that handles its own events.
- Feat: The timeline should have a vertical scrollbar if the tasks exceed the height of the screen.

