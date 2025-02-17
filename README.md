This is my first website created for and actually used by someone. I learned a lot about UI designs and GSAP. Archiving this.

# Franka's website

[![Netlify Status](https://api.netlify.com/api/v1/badges/094deaf7-3a04-4611-b645-53408bf1e33b/deploy-status)](https://app.netlify.com/sites/franka/deploys)

## TODO for the future

- [x] projects/[id] -> click -> 1 photo full screen
- [x] see if I can use height (`vh`) for `sizes` of `Image` for the landscape view
- [x] create a custom `Image` to utilize the Contentful image transformation parameter `h` to further reduce image size accordingly
  - [x] e.g. https://...?fm=webp&w=256&q=60 -> https://...?fm=webp&w=256&h=256&q=60&fit=fill
  - [x] custom loaders for square images or normal images if I will keep using next/image
- [x] mouse hovered + clicked effects for better UX (better user interaction feedbacks)
- [ ] custom mouse cursor
- [x] maybe improve loading overlay? it seems a bit to bland, e.g. could possibly find a way to play with the same square style there
- [ ] favicon design
- [ ] improve meta tags in `head`, e.g. twitter tags
- [ ] three.js
- [ ] move photo full-screen overlay to the root with portal, so that all components can use it as well (e.g. contentful rich text page images)
- [ ] !! Find a workaround to animate page transition without using `key` on the `Component` in `_app` because that is causing page flickering on page change in mobile safari !!
