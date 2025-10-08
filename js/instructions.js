/*
instructions.js

    Instructions Page Functionality
    
    Handles navigation between instruction phases and progression to main experiment
*/

/******************************************************************************
    RUN ON PAGE LOAD
******************************************************************************/
$(document).ready(function() {
    console.log("Instructions page loaded");

    /******************************************************************************
        PHASE NAVIGATION STATE
    ******************************************************************************/
    
    let currentPhase = 0;
    const totalPhases = 7; // 0-6 (added avatar selection phase)
    const completedPhases = new Set();

    /******************************************************************************
        NAVIGATION FUNCTIONS
    ******************************************************************************/
    
    function updatePhaseDisplay() {
        /*
            Update which phase is visible and update UI elements
        */
        // Hide all phases
        $('.instruction-phase').removeClass('active');
        
        // Show current phase
        $(`.instruction-phase[data-phase="${currentPhase}"]`).addClass('active');
        
        // Update progress dots
        $('.progress-dot').each(function() {
            const dotPhase = parseInt($(this).attr('data-phase'));
            $(this).removeClass('active completed');
            
            if (dotPhase === currentPhase) {
                $(this).addClass('active');
            } else if (completedPhases.has(dotPhase)) {
                $(this).addClass('completed');
            }
        });
        
        // Update navigation buttons
        if (currentPhase === totalPhases - 1) {
            // Last phase - show "Start Study" button instead of "Next"
            $('#next-phase-btn').hide();
            $('#proceed-to-task').show();
        } else {
            $('#next-phase-btn').show();
            $('#proceed-to-task').hide();
        }
        
        // Scroll to top of page
        window.scrollTo(0, 0);
    }
    
    function goToNextPhase() {
        /*
            Navigate to next instruction phase
        */
        if (currentPhase < totalPhases - 1) {
            completedPhases.add(currentPhase);
            currentPhase++;
            updatePhaseDisplay();
            
            console.log(`Advanced to phase ${currentPhase}`);
        }
    }
    
    
    function proceedToTask() {
        /*
            Navigate to main experiment task.
            
            Hide instructions page and show the chat interface.
        */
        // Mark all phases as completed
        for (let i = 0; i < totalPhases; i++) {
            completedPhases.add(i);
        }
        
        // Hide Instructions
        $("#instructions-header").attr("hidden", true);
        $("#instructions-main-content").attr("hidden", true);
        
        // Show Task
        $("#task-header").attr("hidden", false);
        $("#task-main-content").attr("hidden", false);
        
        // Load Chat Interface
        $('#task-main-content').load('html/chat-content.html');
        
        // Log completion
        console.log("User completed instructions and proceeded to main task at:", new Date().toISOString());
        console.log("Time spent on instructions:", Math.round((Date.now() - instructionsStartTime) / 1000), "seconds");
    }

    /******************************************************************************
        EVENT LISTENERS
    ******************************************************************************/
    
    $('#next-phase-btn').click(goToNextPhase);
    $('#proceed-to-task').click(proceedToTask);
    
    // Optional: Track time spent on instructions page
    const instructionsStartTime = Date.now();
    
    // Initialize display
    updatePhaseDisplay();
    
    // Optional: Keyboard navigation (right arrow or Enter for next)
    $(document).on('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
            if ($('#next-phase-btn').is(':visible')) {
                goToNextPhase();
            } else if ($('#proceed-to-task').is(':visible')) {
                proceedToTask();
            }
        }
    });
});