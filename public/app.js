$(function() {
	let blockCounter = 0;

	const $editor = $('#editor');
	const $levelId = $('#level-id');

    // to track if a catapult block exists
    let catapultExist = false;

	function createBlock(blockData, blockType) {
		const id = blockData.id

		const block = $('<div></div>')
			.addClass('block')
            .addClass(`type-${blockType}`)
            .attr('type', blockType)
			.attr('id',id)
			.css({
				top: blockData.y,
				left: blockData.x,
				width: blockData.width,
				height: blockData.height,
			})
			.appendTo($editor)
		
		block.draggable({
			containment: "#editor"
		});

		block.on("contextmenu", function (e) {
			e.preventDefault();
			if (confirm("Delete this block")) {
				$(this).remove();
			}
		});

		return block;
	}




	function collectBlocks() {
		const blocks = [];
        // for each block it turns it into a data here
		$(".block").each(function () {
			const b = $(this);

			const pos = b.position();
			blocks.push({
				id: b.attr('id'),
				x: pos.left,
				y: pos.top,
				width: b.width(),
				height: b.height(),
				type: b.attr('type')
			});
		});

		return blocks;
	};

	function renderLevel(blocks) {
		$editor.empty();

		blockCounter = 0;
		blocks.forEach(b => {
            createBlock(b, b.type);
		})
	}

    $('#clear-level').click(function () {
        if (confirm('Are you sure you want to clear the level?')) {
            $editor.empty();
            catapultExist = false; // reset catapult existence
        }
    });

	$('#add-block').click(function () {
        createBlock({}, "default");
    });

    $('#add-catapult').click(function () {
        // check if catapult already exists
        if (catapultExist) {
            alert('Only one catapult block is allowed per level.');
            return;
        }

        catapultExist = true;
        const catapult = createBlock({}, "catapult");

        // override contextt menu
        catapult.on("contextmenu", function (e) {
			e.preventDefault();
			if (confirm("Delete this block")) {
                catapultExist = false;
				$(this).remove();
			}
		});
    });

    // Just add buttons here for other block types
    $('#add-pig').click(function () {
        createBlock({}, "pig");
    });

    $('#add-ice').click(function () {
        createBlock({}, "ice");
    });

    $('#add-wood').click(function () {
        createBlock({}, "wood");
    });

    $('#add-egg').click(function () {
        createBlock({}, "egg");
    });

    // Other buttons
    $('#save-level').click(function () {
        const blocks = collectBlocks();

        if (blocks.length === 0) {
            alert('The level is empty. Add some blocks before saving.');
            return;
        }

        const id = $levelId.val().trim();
        const payload = { blocks };

        let method, url;
        if (id) {
            
            method = 'PUT';
            url = '/api/v1/levels/' + encodeURIComponent(id);
        } else {
            method = 'POST';
            url = '/api/v1/levels';
        }

        $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function (response) {
         
                alert(response.message + ' (ID = ' + response.id + ')');

                if (!id) {
              
                    $levelId.val(response.id);
                }

            },
            error: function (xhr) {
                const msg = xhr.responseJSON?.error || xhr.responseText || 'Unknown error';
                alert('Error saving level: ' + msg);
            }
        });
    });

    $('#load-level').click(function () {
        const id = $levelId.val().trim();

        if (!id) {
            alert('Please enter a Level ID to load.');
            return;
        }

        const url = '/api/v1/levels/' + encodeURIComponent(id);

        $.ajax({
            url,
            method: 'GET',
            contentType: 'application/json',
            success: function (response) {
                renderLevel(response.blocks || []);
                alert('Level loaded successfully.');
            },
            error: function (xhr) {
                const msg = xhr.responseJSON?.error || xhr.responseText || 'Unknown error';
                alert('Error loading level: ' + msg);
            }
        });
    });

    $('#delete-level').click(function () {
        const id = $levelId.val().trim();

        if (!id) {
            alert('Please enter a Level ID to delete.');
            return;
        }

        if (!confirm(`Are you sure you want to delete level "${id}"?`)) {
            return;
        }

        const url = '/api/v1/levels/' + encodeURIComponent(id);

        $.ajax({
            url,
            method: 'DELETE',
            success: function () {
                alert('Level deleted.');

                $levelId.val('');
                $editor.empty();
            },
            error: function (xhr) {
                const msg = xhr.responseJSON?.error || xhr.responseText || 'Unknown error';
                alert('Error deleting level: ' + msg);
            }
        });
    });

});

