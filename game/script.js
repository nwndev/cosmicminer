// Game State
  let game = {
    minerals: 0,
    coins: 0,
    cooldown: 5000, // 5 seconds
    lastMine: 0,
    xp: 0,
    level: 1,
    xpToNextLevel: 50,
    upgrades: {
      pickaxe: { level: 0, cost: 5, effect: 1 },
      cooldown: { level: 0, cost: 15, effect: 0.9 },
      market: { level: 0, cost: 20, effect: 0.1 },
      workerCap: { level: 0, cost: 200, effect: 150 } // Each level increases cap by 50
    },
    workers: [],
    workerMinerals: 0,
    workerCost: 600,
    maxWorkers: 3,
    mineralCap: 150,
    isCapReached: false
  }

function soundLevelUp() {
    var sound = new Audio('./sounds/levelup.mp3');
    sound.play();
}

function soundBuy() {
    var sound = new Audio('./sounds/buy.mp3')
    sound.play();
}

function soundBreak() {
    var sound = new Audio('./sounds/break.mp3')
    sound.play()
}

function soundSell() {
    var sound = new Audio('./sounds/sell.mp3')
    sound.play()
}

function soundCap() {
    var sound = new Audio('./sounds/cap.mp3')
    sound.play()
}

function soundMine() {
    var sound = new Audio('./sounds/mine.mp3');
    var playCount = 0;
    var maxPlays = Math.ceil(game.cooldown / 1000);
    var delay = 500;

    function playSound() {
        sound.currentTime = 0;
        sound.play();
    }

    sound.addEventListener('ended', function() {
        playCount++;
        if (playCount < maxPlays) {
            setTimeout(playSound, delay);
        }
    });

    playSound();
}
  
  // DOM Elements
  const elements = {
    minerals: document.getElementById('minerals'),
    coins: document.getElementById('coins'),
    mineBtn: document.getElementById('mine-btn'),
    sellBtn: document.getElementById('sell-btn'),
    cooldownBar: document.getElementById('cooldown-bar'),
    cooldownText: document.getElementById('cooldown-text'),
    floatingCoins: document.getElementById('floating-coins'),
    floatingCoinsDisplay: document.getElementById('floating-coins-display'),
    floatingMineralsDisplay: document.getElementById('floating-minerals-display'),
    resourcesPanel: document.querySelector('.bg-blue-900.bg-opacity-70'), // First panel is resources
  };
  
  // Initialize the game
  function init() {
    updateUI();
    setupEventListeners();
    checkCooldown();
    initWorkers();
  }

  // Initialize workers
  function initWorkers() {
    game.workers.forEach(worker => {
      worker.intervalId = setInterval(() => {
        mineWithWorker(worker);
      }, worker.interval);
    });
    updateWorkerUI();
  }

  // Mine with a worker
  function mineWithWorker(worker) {
    if (game.workerMinerals >= game.mineralCap) {
      if (!game.isCapReached) {
        soundCap(); // Play sound only when first reaching cap
      }
      game.isCapReached = true;
      updateWorkerUI();
      return;
    }
    
    const pickaxeBonus = 1 + game.upgrades.pickaxe.level * game.upgrades.pickaxe.effect;
    const gained = Math.floor(Math.random() * pickaxeBonus) + 1;
    game.workerMinerals = Math.min(game.workerMinerals + gained, game.mineralCap);
    worker.lastMine = Date.now();
    
    if (game.workerMinerals >= game.mineralCap) {
      if (!game.isCapReached) {
        soundCap(); // Play sound only when first reaching cap
      }
      game.isCapReached = true;
    }
    
    updateWorkerUI();
    updateUI();
  }

  // Update worker UI
  function updateWorkerUI() {
    const workerSlots = document.querySelectorAll('.worker-slot');
    workerSlots.forEach((slot, index) => {
        const workerContent = slot.querySelector('.worker-content');
        const emptySlot = slot.querySelector('.empty-slot');
        const nameEl = slot.querySelector('.worker-name');
      
      if (index < game.workers.length) {
        // Show worker content
        workerContent.classList.remove('hidden');
        emptySlot.classList.add('hidden');
        if (nameEl) {
          nameEl.textContent = worker.name;
        }
        
        // Update worker progress
        const worker = game.workers[index];
        const progress = slot.querySelector('.worker-progress');
    if (progress) {
      // Clear any existing interval to prevent duplicates
      if (worker.updateInterval) clearInterval(worker.updateInterval);
      
      worker.updateInterval = setInterval(() => {
        const elapsed = Date.now() - worker.lastMine || 0;
        const progressPercent = Math.min(100, (elapsed / worker.interval) * 100);
        progress.style.width = `${progressPercent}%`;
        
        // Update countdown timer
        const countdownEl = slot.querySelector('.countdown-timer');
        if (countdownEl) {
          const remaining = (worker.interval - elapsed) / 1000;
          countdownEl.textContent = remaining > 0 ? `${remaining.toFixed(1)}s` : 'Ready!';
          
          // Update worker minerals display
          const workerMineralsEl = document.getElementById('worker-minerals');
          const workerCapEl = document.getElementById('worker-mineral-cap');
          if (workerMineralsEl && workerCapEl) {
            workerMineralsEl.textContent = game.workerMinerals;
            workerCapEl.textContent = game.mineralCap;
          }
        }
        
        if (progressPercent >= 100) {
          clearInterval(worker.updateInterval);
        }
      }, 50); // Update every 50ms for smooth animation
    }
      } else {
        // Show empty slot
        workerContent.classList.add('hidden');
        emptySlot.classList.remove('hidden');
      }
    });

    // Update gather button state
    const gatherAllBtn = document.getElementById('gather-all-btn');
    if (gatherAllBtn) {
      gatherAllBtn.disabled = game.workerMinerals <= 0;
    }
  }
  
  // Animate number counting
  function animateValue(element, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();
    const step = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.floor(start + progress * range);
      element.textContent = value;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  // Update all UI elements
  function updateUI() {
    try {
      // Update basic resources with animation
      if (elements.minerals) {
        const current = parseInt(elements.minerals.textContent) || 0;
        animateValue(elements.minerals, current, game.minerals, 500);
      }
      if (elements.coins) {
        const current = parseInt(elements.coins.textContent) || 0;
        animateValue(elements.coins, current, game.coins, 500);
      }
      
      // Update worker minerals display with animation
      const workerMineralsEl = document.getElementById('worker-minerals');
      if (workerMineralsEl) {
        const current = parseInt(workerMineralsEl.textContent) || 0;
        animateValue(workerMineralsEl, current, game.workerMinerals, 500);
      }
      if (elements.floatingCoinsDisplay) {
        const current = parseInt(elements.floatingCoinsDisplay.textContent) || 0;
        animateValue(elements.floatingCoinsDisplay, current, game.coins, 500);
      }
      if (elements.floatingMineralsDisplay) {
        const current = parseInt(elements.floatingMineralsDisplay.textContent) || 0;
        animateValue(elements.floatingMineralsDisplay, current, game.minerals, 500);
      }
      
      // Update XP display
      const xpBar = document.getElementById('xp-bar');
      if (xpBar) {
        const levelEl = document.getElementById('player-level');
        const currentXpEl = document.getElementById('current-xp');
        const nextLevelXpEl = document.getElementById('next-level-xp');
        
        if (levelEl) levelEl.textContent = game.level;
        if (currentXpEl) currentXpEl.textContent = game.xp;
        if (nextLevelXpEl) nextLevelXpEl.textContent = game.xpToNextLevel;
        xpBar.style.width = `${(game.xp / game.xpToNextLevel) * 100}%`;
        
        // Update star color based on level
        const star = document.querySelector('#player-level + .fa-star');
        if (star) {
          star.classList.toggle('text-yellow-300', game.level >= 10);
          star.classList.toggle('text-yellow-400', game.level < 10);
        }
      }
      
      // Update stats display
      const pickaxeEffect = 1 + (game.upgrades.pickaxe?.level || 0) * (game.upgrades.pickaxe?.effect || 0);
      const mineSpeed = (100 - (game.cooldown / 5000 * 100)).toFixed(0);
      const sellValue = (100 + (game.upgrades.market?.level || 0) * (game.upgrades.market?.effect || 0) * 100).toFixed(0);
      const sellTotal = Math.floor(game.minerals * (1 + (game.upgrades.market?.level || 0) * (game.upgrades.market?.effect || 0)));
      
      const perClickEl = document.getElementById('per-click');
      const mineSpeedEl = document.getElementById('mine-speed');
      const sellValueEl = document.getElementById('sell-value');
      const sellTotalEl = document.getElementById('sell-total');
      
      if (perClickEl) perClickEl.textContent = `1~${pickaxeEffect}`;
      if (mineSpeedEl) mineSpeedEl.textContent = `${mineSpeed}%`;
      if (sellValueEl) sellValueEl.textContent = `${sellValue}%`;
      if (sellTotalEl) sellTotalEl.textContent = sellTotal;
      
      // Update upgrade buttons and level displays
      document.querySelectorAll('.upgrade-btn').forEach(btn => {
        try {
          const type = btn.dataset.type;
          if (!type) return;
          
          // Handle worker upgrade separately
          if (type === 'worker') {
            const costEl = btn.querySelector('.cost');
            if (costEl) costEl.textContent = game.workerCost;
            
            const levelBadge = btn.closest('.upgrade-card')?.querySelector('.level-badge');
            if (levelBadge) {
              levelBadge.textContent = `${game.workers.length}/${game.maxWorkers}`;
            }
            
            if (game.workers.length >= game.maxWorkers) {
              btn.disabled = true;
              btn.innerHTML = '<i class="fas fa-check-circle"></i> Maxed Out';
              return;
            }
            
            btn.disabled = game.coins < game.workerCost;
            return;
          }
          
          // Handle regular upgrades
          const upgrade = game.upgrades[type];
          if (!upgrade) return;
          
          const costEl = btn.querySelector('.cost');
          if (costEl) costEl.textContent = upgrade.cost || 0;
          
          // Update level display
          const levelBadge = btn.closest('.upgrade-card')?.querySelector('.level-badge');
          if (levelBadge) {
            levelBadge.textContent = upgrade.level || 0;
            // Change badge color based on level
            levelBadge.classList.toggle('bg-yellow-300', upgrade.level >= 5);
            levelBadge.classList.toggle('bg-yellow-500', upgrade.level < 5);
          }

          // Special case for cooldown upgrade
          if (type === 'cooldown') {
            const currentSpeed = 100 - (game.cooldown / 5000 * 100);
            if (currentSpeed >= 80) {
              btn.disabled = true;
              btn.innerHTML = '<i class="fas fa-check-circle"></i> Max Speed';
              return;
            }
          }

          btn.disabled = game.coins < (upgrade.cost || Infinity);
        } catch (e) {
          console.error('Error updating upgrade button:', e);
        }
      });
    } catch (e) {
      console.error('Error in updateUI:', e);
    }
  }
  
  // Set up event listeners
  function setupEventListeners() {
    // Ensure elements exist before adding listeners
    if (elements.mineBtn) {
      elements.mineBtn.addEventListener('click', () => {
        if (Date.now() - game.lastMine >= game.cooldown) {
          mine();
          game.lastMine = Date.now();
          startCooldown();
        }
      });
    }

    if (elements.sellBtn) {
      elements.sellBtn.addEventListener('click', sellAll);
    }

    // Upgrade buttons
    const upgradeButtons = document.querySelectorAll('.upgrade-btn');
    if (upgradeButtons.length > 0) {
      upgradeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.dataset.type;
          if (type) {
            if (buyUpgrade(type)) {
              updateUI(); // Force UI refresh after successful upgrade
            }
          }
        });
      });
    }

    // Worker gather all button
    document.getElementById('gather-all-btn')?.addEventListener('click', gatherAllWorkerMinerals);

    // Debug log to verify listeners are set
    console.log('Event listeners initialized');
  }
  
  // Mining function
  function mine() {
    const pickaxeBonus = 1 + game.upgrades.pickaxe.level * game.upgrades.pickaxe.effect;
    elements.mineBtn.disabled = true;
    soundMine()
    
    // Show mining animation
    elements.mineBtn.innerHTML = '<i class="fas fa-hammer"></i> MINING...';
    elements.mineBtn.classList.add('animate-pulse');
    
    setTimeout(() => {
      const gained = Math.floor(Math.random() * pickaxeBonus) + 1;
      game.minerals += gained;
      game.xp += gained;
      soundBreak();
      checkLevelUp();
      
      // Show mining bonus
      const bonusText = document.getElementById('mining-bonus');
      bonusText.textContent = `(+${gained})`;
      bonusText.classList.remove('opacity-0');
      bonusText.classList.add('opacity-100');
      setTimeout(() => bonusText.classList.replace('opacity-100', 'opacity-0'), 1000);
      
      elements.mineBtn.innerHTML = '<i class="fas fa-hammer"></i> MINE';
      elements.mineBtn.classList.remove('animate-pulse');
      elements.mineBtn.disabled = false;
      updateUI();
    }, game.cooldown);
  }
  
  // Sell all minerals
  function sellAll() {
    const marketBonus = 1 + game.upgrades.market.level * game.upgrades.market.effect;
    game.coins += Math.floor(game.minerals * marketBonus);
    game.minerals = 0;
    updateUI();
    soundSell();
  }
  
  // Start cooldown timer
  function startCooldown() {
    elements.mineBtn.disabled = true;
    const startTime = Date.now();
    const endTime = startTime + game.cooldown;
    
    const cooldownInterval = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      const progress = ((game.cooldown - remaining) / game.cooldown) * 100;
      
      elements.cooldownBar.style.width = `${progress}%`;
      elements.cooldownText.textContent = `${(remaining / 1000).toFixed(1)}s`;
      
      if (remaining <= 0) {
        clearInterval(cooldownInterval);
        elements.mineBtn.disabled = false;
        elements.cooldownBar.style.width = '0%';
        elements.cooldownText.textContent = 'Ready!';
      }
    }, 50);
  }
  
  // Check cooldown on page load
  function checkCooldown() {
    const remaining = game.lastMine + game.cooldown - Date.now();
    if (remaining > 0) {
      elements.mineBtn.disabled = true;
      const progress = ((game.cooldown - remaining) / game.cooldown) * 100;
      elements.cooldownBar.style.width = `${progress}%`;
      elements.cooldownText.textContent = `${(remaining / 1000).toFixed(1)}s`;
      setTimeout(() => {
        elements.mineBtn.disabled = false;
        elements.cooldownBar.style.width = '0%';
        elements.cooldownText.textContent = 'Ready!';
      }, remaining);
    }
  }
  
  // Buy upgrade
  function buyUpgrade(type) {
    // Validate input
    if (!type) return false;
    
    // Handle worker upgrade separately
    if (type === 'worker') {
      if (game.workers.length >= game.maxWorkers) return false;
      if (game.coins >= game.workerCost) {
        hireWorker();
        game.coins -= game.workerCost;
        game.workerCost *= 2; // 600 -> 1200 -> 2400
        updateUI();
        soundBuy();
        return true;
      }
      return false;
    }

    // Handle worker cap upgrade separately
    if (type === 'workerCap') {
      if (game.workers.length === 0) {
        alert("You need to hire at least one worker first!");
        return false;
      }
      
      const upgrade = game.upgrades[type];
      if (!upgrade || !upgrade.cost) return false;
      
      if (game.coins >= upgrade.cost) {
        game.coins -= upgrade.cost;
        game.mineralCap += upgrade.effect;
        upgrade.level++;
        upgrade.cost = Math.floor(upgrade.cost * 1.5); // Increase cost by 50%
        soundBuy();
        return true;
      }
      return false;
    }

    // Handle regular upgrades
    const upgrade = game.upgrades[type];
    if (!upgrade || !upgrade.cost) return false;
    
    // Special case for cooldown upgrade
    if (type === 'cooldown') {
      const currentSpeed = 100 - (game.cooldown / 5000 * 100);
      if (currentSpeed >= 80) return false;
    }

    if (game.coins >= upgrade.cost) {
      game.coins -= upgrade.cost;
      upgrade.level++;
      upgrade.cost = Math.floor(upgrade.cost * 1.5); // Increase cost by 50%
      
      // Apply upgrade effects
      if (type === 'cooldown') {
        game.cooldown = Math.max(1000, 5000 * Math.pow(0.9, upgrade.level));
      }
      
      updateUI();
      soundBuy();
      return true;
    }
    return false;
  }

  // Hire a new worker
  function hireWorker() {
    if (game.workers.length >= game.maxWorkers) return;
    
    // More varied intervals between 1-5 seconds
    const interval = 1000 + Math.random() * 4000;
    const efficiency = 0.5 + Math.random(); // 0.5-1.5 efficiency
    
    const worker = {
      interval: interval,
      intervalId: null,
      lastMine: Date.now(),
      name: `Worker ${String.fromCharCode(65 + game.workers.length)}`, // Worker A, B, C
      efficiency: efficiency,
      speed: (1/(interval/1000)).toFixed(2) + "/sec" // Mining speed
    };
    
    // Add animation to worker icon
    const workerSlot = document.querySelectorAll('.worker-slot')[game.workers.length];
    const workerIcon = workerSlot.querySelector('.fa-hard-hat');
    workerIcon.classList.add('animate-bounce');
    workerIcon.style.animationDuration = `${interval}ms`;
    
    worker.intervalId = setInterval(() => {
      mineWithWorker(worker);
    }, interval);
    
    game.workers.push(worker);
    
    // Show worker resources container if this is the first worker
    if (game.workers.length === 1) {
      document.getElementById('worker-resources-container').classList.remove('hidden');
    }
    
    updateWorkerUI();
  }

  // Gather all worker minerals
  function gatherAllWorkerMinerals() {
    if (game.workerMinerals > 0) {
      game.minerals += game.workerMinerals;
      game.xp += game.workerMinerals;
      game.workerMinerals = 0;
      game.isCapReached = false;
      
      // Update displays
      const workerMineralsEl = document.getElementById('worker-minerals');
      if (workerMineralsEl) {
        workerMineralsEl.textContent = game.workerMinerals;
      }
      
      updateUI();
      updateWorkerUI();
      soundSell();
      checkLevelUp();
    }
  }
  
  // Check for level up
  function checkLevelUp() {
    if (game.xp >= game.xpToNextLevel) {
      game.level++;
      game.xp -= game.xpToNextLevel;
      game.xpToNextLevel = Math.floor(game.xpToNextLevel * 1.4); // Increase by 40% each level
      soundLevelUp();
      
      // Animate star on level up
      const star = document.querySelector('#player-level + .fa-star');
      if (star) {
        star.classList.add('animate-pulse', 'text-yellow-200');
        setTimeout(() => {
          star.classList.remove('animate-pulse', 'text-yellow-200');
        }, 1000);
      }
      
      updateUI();
      saveGame(); // Save after level up
    }
  }

  // Save game state to localStorage
  function saveGame() {
    const saveData = {
      ...game,
      xp: game.xp,
      level: game.level,
      xpToNextLevel: game.xpToNextLevel,
      workers: game.workers.map(worker => ({
        interval: worker.interval,
        lastMine: worker.lastMine
      })),
      workerMinerals: game.workerMinerals,
      workerCost: game.workerCost,
      upgrades: game.upgrades
    };
    localStorage.setItem('cosmicMinerSave', JSON.stringify(saveData));
  }
  
  // Load game state from localStorage
  function loadGame() {
    const save = localStorage.getItem('cosmicMinerSave');
    if (save) {
      const loaded = JSON.parse(save);
      // Handle both new and legacy saves
      game = {
        minerals: loaded.minerals || 0,
        coins: loaded.coins || 0,
        cooldown: loaded.cooldown || 5000,
        lastMine: loaded.lastMine || 0,
        upgrades: loaded.upgrades || {
          pickaxe: { level: 0, cost: 5, effect: 1 },
          cooldown: { level: 0, cost: 15, effect: 0.9 },
          market: { level: 0, cost: 20, effect: 0.1 }
        },
        xp: loaded.xp || 0,
        level: loaded.level || 1,
        xpToNextLevel: loaded.xpToNextLevel || 50,
        workers: loaded.workers || [],
        workerMinerals: loaded.workerMinerals || 0,
        workerCost: loaded.workerCost || 100,
        maxWorkers: loaded.maxWorkers || 3,
        mineralCap: loaded.mineralCap || 150,
        isCapReached: loaded.isCapReached || false
      };
      
      // Restore worker intervals and animations
      if (game.workers.length > 0) {
        game.workers.forEach((worker, index) => {
          worker.intervalId = setInterval(() => {
            mineWithWorker(worker);
          }, worker.interval);
          
          // Restore animation for worker icon
          const workerSlot = document.querySelectorAll('.worker-slot')[index];
          if (workerSlot) {
            const workerIcon = workerSlot.querySelector('.fa-hard-hat');
            if (workerIcon) {
              workerIcon.classList.add('animate-bounce');
              workerIcon.style.animationDuration = `${worker.interval}ms`;
            }
          }
        });
        // Show worker resources container
        document.getElementById('worker-resources-container').classList.remove('hidden');
      }
    }
  }
  
  // Auto-save every 2 minutes with notification
  function setupAutoSave() {
    setInterval(() => {
      saveGame();
      showSaveNotification();
    }, 120000); // 120000ms = 2 minutes
  }

  // Show save notification
  function showSaveNotification() {
    const notification = document.getElementById('save-notification');
    if (notification) {
      notification.classList.remove('opacity-0');
      notification.classList.add('opacity-100');
      
      setTimeout(() => {
        notification.classList.remove('opacity-100');
        notification.classList.add('opacity-0');
      }, 2000); // Fade out after 2 seconds
    }
  }
  
  // Check if resources panel is visible
  function isResourcesPanelVisible() {
    const rect = elements.resourcesPanel.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  }

  // Handle scroll events
  function handleScroll() {
    if (isResourcesPanelVisible()) {
      elements.floatingCoins.classList.remove('opacity-100');
      elements.floatingCoins.classList.add('opacity-0');
    } else {
      elements.floatingCoins.classList.remove('opacity-0');
      elements.floatingCoins.classList.add('opacity-100');
    }
  }

  // Modal functionality
  function setupModal() {
    // About modal
    const aboutLink = document.querySelector('a[href="#about"]');
    const aboutModal = document.getElementById('about-modal');
    const closeAboutModal = document.getElementById('close-about-modal');

    if (aboutLink && aboutModal && closeAboutModal) {
      aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.classList.add('show');
      });

      closeAboutModal.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.classList.remove('show');
      });

      aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
          aboutModal.classList.remove('show');
        }
      });
    }

    // Credits modal
    const creditsLink = document.querySelector('a[href="#credits"]');
    const creditsModal = document.getElementById('credits-modal');
    const closeCreditsModal = document.getElementById('close-credits-modal');

    if (creditsLink && creditsModal && closeCreditsModal) {
      creditsLink.addEventListener('click', (e) => {
        e.preventDefault();
        creditsModal.classList.add('show');
      });

      closeCreditsModal.addEventListener('click', (e) => {
        e.preventDefault();
        creditsModal.classList.remove('show');
      });

      creditsModal.addEventListener('click', (e) => {
        if (e.target === creditsModal) {
          creditsModal.classList.remove('show');
        }
      });
    }
  }

  // Handle splash screen transition
  function handleSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    
    // Show splash screen for 3 seconds then fade out
    setTimeout(() => {
      splashScreen.style.opacity = '0';
      
      // After fade out completes, remove splash and show main content
      splashScreen.addEventListener('transitionend', () => {
        splashScreen.remove();
        mainContent.classList.remove('hidden');
      }, { once: true });
    }, 3000);
  }

  // Delete progress functionality
  document.getElementById('delete-progress')?.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Delete progress link clicked');
    const modal = document.getElementById('delete-modal');
    modal.classList.add('show');
    console.log('Modal should be visible now');
  });

  // Delete modal handlers
  document.getElementById('confirm-delete')?.addEventListener('click', function() {
    localStorage.clear();
    location.reload();
  });

  document.getElementById('cancel-delete')?.addEventListener('click', function() {
    document.getElementById('delete-modal').classList.remove('show');
  });

  document.getElementById('delete-modal')?.addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.remove('show');
    }
  });

  // Initialize the game when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    handleSplashScreen();
    setupModal();
    loadGame();
    
    // Show welcome modal for first-time players
    setTimeout(() => {
      const welcomeModal = document.getElementById('welcome-modal');
      const closeWelcome = document.getElementById('close-welcome');
      
      if (!localStorage.getItem('cosmicMinerSave')) {
        welcomeModal.classList.remove('opacity-0', 'pointer-events-none');
        welcomeModal.classList.add('opacity-100');
      }
      
      closeWelcome.addEventListener('click', () => {
        welcomeModal.classList.remove('opacity-100');
        welcomeModal.classList.add('opacity-0', 'pointer-events-none');
      });
    }, 3100);
    
    // Initialize worker minerals display
    const workerMineralsEl = document.getElementById('worker-minerals');
    const workerCapEl = document.getElementById('worker-mineral-cap');
    if (workerMineralsEl && workerCapEl) {
      workerMineralsEl.textContent = game.workerMinerals;
      workerCapEl.textContent = game.mineralCap;
    }
    
    init();
    setupAutoSave();
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    showSaveNotification(); // Show initial save notification
  });
