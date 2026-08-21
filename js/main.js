/**
 * STATIC FRAMES — site behaviour
 * Renders project grids from js/projects.js, drives the mobile
 * nav toggle, and stamps the footer year.
 */
(function () {
  'use strict';

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function categoryLabel(cat) {
    return { narrative: 'Narrative', commercial: 'Commercial & Corporate', personal: 'Personal Projects' }[cat] || cat;
  }

  function buildTile(project, index) {
    const wrapper = document.createElement('a');
    wrapper.className = 'tile';
    wrapper.href = 'project.html?id=' + encodeURIComponent(project.id);

    let mediaHtml = '';
    if ((project.type === 'video' || project.type === 'image' || project.type === 'embed') && project.thumb) {
      mediaHtml = `<img class="tile__media" src="${escapeHtml(project.thumb)}" alt="" loading="lazy">`;
    } else {
      mediaHtml = `<div class="tile__placeholder"><span class="tile__placeholder-mark">Media pending</span></div>`;
    }

    wrapper.innerHTML = `
      ${mediaHtml}
      <span class="tile__category">${escapeHtml(categoryLabel(project.category))}</span>
      <div class="tile__overlay">
        <span class="tile__index eyebrow">${String(index + 1).padStart(2, '0')}</span>
        <div class="tile__meta">
          <span class="tile__client">${escapeHtml(project.client)}</span>
          <span class="tile__title">${escapeHtml(project.title)}</span>
        </div>
      </div>
    `;
    return wrapper;
  }

  function renderGrid(containerId, projects) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    projects.forEach(function (p, i) {
      el.appendChild(buildTile(p, i));
    });
  }

  function buildMasonryItem(still, index) {
    const item = document.createElement('div');
    item.className = 'masonry__item';
    if (still.image) {
      item.innerHTML = `
        <img src="${escapeHtml(still.image)}" alt="${escapeHtml(still.title)}" loading="lazy">
        ${still.title ? `<span class="masonry__caption">${escapeHtml(still.title)}</span>` : ''}
      `;
    } else {
      item.innerHTML = `<div class="masonry__placeholder" style="--ph-ratio:${escapeHtml(still.ratio || '4/5')}">
        <span class="tile__placeholder-mark">Media pending</span>
      </div>`;
    }
    return item;
  }

  function renderMasonry(containerId, stills) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    stills.forEach(function (s, i) {
      el.appendChild(buildMasonryItem(s, i));
    });
  }

  function toEmbedSrc(url) {
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return 'https://player.vimeo.com/video/' + vimeoMatch[1];
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return 'https://www.youtube.com/embed/' + ytMatch[1];
    const wistiaMatch = url.match(/wistia\.(?:com|net)\/(?:medias|embed(?:\/iframe)?)\/([a-zA-Z0-9]+)/);
    if (wistiaMatch) return 'https://fast.wistia.net/embed/iframe/' + wistiaMatch[1];
    const liMatch = url.match(/urn:li:(activity|ugcPost|share):(\d+)/) || url.match(/linkedin\.com\/posts\/.*?-(activity|ugcPost|share)-(\d+)-/);
    if (liMatch) return 'https://www.linkedin.com/embed/feed/update/urn:li:' + liMatch[1] + ':' + liMatch[2];
    const fbMatch = url.match(/facebook\.com\/(?:[\w.]+\/videos\/\d+|reel\/\d+|watch\/?\?v=\d+)/);
    if (fbMatch) {
      const cleanUrl = 'https://www.' + fbMatch[0];
      return 'https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(cleanUrl) + '&show_text=false';
    }
    return null;
  }

  function initProjectDetail() {
    const heroEl = document.getElementById('project-hero');
    if (!heroEl) return;

    const id = new URLSearchParams(location.search).get('id');
    const project = (typeof PROJECTS !== 'undefined' ? PROJECTS : []).find(function (p) { return p.id === id; });

    if (!project) {
      document.getElementById('project-title').textContent = 'Project not found';
      document.getElementById('project-meta').textContent = '';
      heroEl.innerHTML = '<div class="tile__placeholder"><span class="tile__placeholder-mark">No project found</span></div>';
      return;
    }

    document.title = project.title + ' — Static Frames | Dinesh Thapa, Camera Operator';
    document.getElementById('project-title').textContent = project.title;
    document.getElementById('project-meta').textContent = project.client + ' — ' + categoryLabel(project.category);

    const backLink = document.getElementById('project-back');
    const backLabel = document.getElementById('project-back-label');
    if (backLink) backLink.href = project.category + '.html';
    if (backLabel) backLabel.textContent = categoryLabel(project.category);

    const descEl = document.getElementById('project-description');
    if (descEl) {
      const descText = project.description
        ? project.description
        : "Add a project description here — the brief, your role on the shoot, and any notable techniques or gear used. Edit this project's \"description\" field in js/projects.js.";
      descEl.innerHTML = descText
        .split(/\n{2,}/)
        .map(function (para) {
          var safe = escapeHtml(para)
            .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/gs, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            .replace(/\*\*\*(.+?)\*\*\*/gs, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.+?)\*\*/gs, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/gs, '<em>$1</em>')
            .replace(/\n/g, '<br>');
          return '<p>' + safe + '</p>';
        })
        .join('');
    }

    let mediaHtml;
    if (project.type === 'video' && project.src) {
      mediaHtml = `<video class="project-hero__media" controls preload="metadata" ${project.thumb ? `poster="${escapeHtml(project.thumb)}"` : ''}>
        <source src="${escapeHtml(project.src)}" type="video/mp4">
      </video>`;
    } else if (project.type === 'embed' && project.embedUrl) {
      const embedSrc = toEmbedSrc(project.embedUrl);
      mediaHtml = embedSrc
        ? `<iframe class="project-hero__media" src="${escapeHtml(embedSrc)}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
        : `<img class="project-hero__media" src="${escapeHtml(project.thumb)}" alt="">`;
    } else if (project.type === 'image' && (project.src || project.thumb)) {
      mediaHtml = `<img class="project-hero__media" src="${escapeHtml(project.src || project.thumb)}" alt="">`;
    } else {
      mediaHtml = `<div class="tile__placeholder"><span class="tile__placeholder-mark">Media pending</span></div>`;
    }
    heroEl.innerHTML = mediaHtml;
    heroEl.classList.toggle('project-hero--auto', project.type === 'image' || project.type === 'video');
    heroEl.classList.toggle('project-hero--vertical', project.type === 'embed' && /facebook\.com\/reel\/|linkedin\.com/.test(project.embedUrl || ''));
    heroEl.style.aspectRatio = '';

    if (project.type === 'embed' && project.embedUrl) {
      const wistiaId = (project.embedUrl.match(/wistia\.(?:com|net)\/(?:medias|embed(?:\/iframe)?)\/([a-zA-Z0-9]+)/) || [])[1];
      if (wistiaId) {
        fetch('https://fast.wistia.com/embed/medias/' + wistiaId + '.json')
          .then(function (r) { return r.json(); })
          .then(function (data) {
            const ratio = data && data.media && data.media.aspectRatio;
            if (ratio) heroEl.style.aspectRatio = String(ratio);
          })
          .catch(function () {});
      }
    }
  }

  function initMobileNav() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.getElementById('site-nav-mobile');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      const isOpen = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        panel.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  function initImageProtection() {
    var selector = '.tile__media, .masonry__item img, .project-hero__media, .about__portrait img';
    document.addEventListener('contextmenu', function (e) {
      if (e.target.closest(selector)) e.preventDefault();
    });
    document.addEventListener('dragstart', function (e) {
      if (e.target.closest(selector)) e.preventDefault();
    });
  }

  function stampYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  function initPreloader() {
    var overlay = document.getElementById('intro-overlay');
    if (!overlay) return;

    var skip = window.matchMedia('(prefers-reduced-motion: reduce)').matches || sessionStorage.getItem('sfIntroSeen');
    if (skip) {
      overlay.remove();
      return;
    }
    sessionStorage.setItem('sfIntroSeen', '1');
    document.body.classList.add('intro-lock');

    var HOLD_MS = 2950; // name zooms in/out, brackets expand, then thumbnails whip-zoom through in one continuous sequence
    var finished = false;

    function remove() {
      document.body.classList.remove('intro-lock');
      overlay.remove();
    }
    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      overlay.classList.add('intro-overlay--fade');
      overlay.addEventListener('animationend', remove, { once: true });
      setTimeout(remove, 750);
    }

    var timer = setTimeout(finish, HOLD_MS);
    overlay.addEventListener('click', finish);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initPreloader();
    initMobileNav();
    initImageProtection();
    stampYear();

    const featuredGrid = document.getElementById('featured-grid');
    if (featuredGrid && typeof PROJECTS !== 'undefined') {
      renderGrid('featured-grid', PROJECTS.filter(function (p) { return p.featured; }));
    }

    ['narrative', 'commercial', 'personal'].forEach(function (cat) {
      const gridId = cat + '-grid';
      if (document.getElementById(gridId) && typeof PROJECTS !== 'undefined') {
        renderGrid(gridId, PROJECTS.filter(function (p) { return p.category === cat; }));
      }
    });

    if (document.getElementById('stills-grid') && typeof STILLS !== 'undefined') {
      renderMasonry('stills-grid', STILLS);
    }

    initProjectDetail();
  });
})();
