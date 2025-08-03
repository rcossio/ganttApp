import { RemoveMemberButton } from './specialButtons.js';
import { positionPopup } from './popups.js';

function TeamMemberRow(member, popup) {
  const row = document.createElement('button');
  row.className = 'btn btn-sm popup-btn';
  row.textContent = `👤 ${member.initials} - ${member.email}`;
  row.style.cursor = 'default';
  row.disabled = false;
  // Add right-click to remove member
  row.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    // Remove only other context menus, not the main team popup
    document.querySelectorAll('.context-menu').forEach(p => {
      if (p !== popup) p.remove();
    });
    // Remove member context menu
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.appendChild(RemoveMemberButton(member, () => renderTeamList(container)));
    document.body.appendChild(menu);
    positionPopup(menu, row);
    // Only close this menu on outside click
    function onClickOutside(ev) {
      if (!menu.contains(ev.target)) {
        document.removeEventListener('mousedown', onClickOutside);
        menu.remove();
      }
    }
    setTimeout(() => {
      document.addEventListener('mousedown', onClickOutside);
    }, 0);
  });
  return row;
}

export default TeamMemberRow;