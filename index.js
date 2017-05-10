// vers 1.0.0

const boxIds = [
	169886, 169887, 169888, 169889, 169890, 169891 // strongboxes
]

const format = require('./format.js');

module.exports = function NoStrongboxes(dispatch) {
	let enabled = true,
	cid;
		
    const chatHook = event => {		
		let command = format.stripTags(event.message).split(' ');
		
		if (['!nostrongboxes'].includes(command[0].toLowerCase())) {
			toggleModule();
			return false;
		}
	}
	dispatch.hook('C_CHAT', 1, chatHook)	
	dispatch.hook('C_WHISPER', 1, chatHook)
  	
	// slash support
	try {
		const Slash = require('slash')
		const slash = new Slash(dispatch)
		slash.on('nostrongboxes', args => toggleModule())
	} catch (e) {
		// do nothing because slash is optional
	}
	
	function toggleModule() {
		enabled = !enabled;
		systemMessage((enabled ? 'enabled' : 'disabled'));
	}
	
	dispatch.hook('S_LOGIN', 2, (event) => {
		cid = event.cid;
	})
	
	dispatch.hook('S_INVEN', 3, (event) => {
		if (!enabled) return;
		
		for ( var i = 0; i < event.items.length; i++) {
			// If a strongbox is found, discard it.
			if (boxIds.includes(event.items[i].item)) {
				itemSlot = event.items[i].slot;
				
				dispatch.toServer('C_DEL_ITEM', 1, {
					cid: cid,
					slot: (itemSlot - 40),
					amount: event.amount
				});
			}
		}
	})
		
	dispatch.hook('S_SPAWN_DROPITEM', 1, (event) => {
		if (!enabled) return;
		// Do not spawn strongboxes
		if (boxIds.includes(event.item)) {
			return false;
		}
	})	
		
	function systemMessage(msg) {
		dispatch.toClient('S_CHAT', 1, {
			channel: 24,
			authorID: 0,
			unk1: 0,
			gm: 0,
			unk2: 0,
			authorName: '',
			message: ' (No-Strongboxes) ' + msg
		});
	}

}