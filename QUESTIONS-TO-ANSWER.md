# Questions to Answer Before Implementation

## 🎯 **Critical Questions**

### 1. **Watch Time Limits**
**Question:** How does the 1-hour free browsing limit work?
- [ ] Is it 1 hour per day (resets at midnight)?
- [ ] Is it 1 hour per session?
- [ ] Is it cumulative across all videos?
- [ ] Does the timer pause when they navigate away?
- [ ] Does it track actual watch time or just time on page?

**My Suggestion:** 1 hour per day (resets at midnight user's timezone), tracks actual video watch time, pauses when video is paused.

---

### 2. **Ad-Based Time Unlocks**
**Question:** How do ads work for unlocking extra time?
- [ ] What ad platform? (Google AdSense, custom video ads, etc.)
- [ ] How do we verify they watched the full ad?
- [ ] Does the 3x daily limit reset at midnight?
- [ ] Can they watch multiple ads at once or must they use the time first?

**My Suggestion:** Use Google AdSense video ads, verify completion via AdSense API, reset at midnight, must use time before watching another ad.

---

### 3. **Free Monthly Video Unlock**
**Question:** How does the "1 free 30min video unlock per month" work?
- [ ] Can they unlock ONE video that's up to 30 minutes long?
- [ ] OR can they unlock multiple videos totaling 30 minutes?
- [ ] Is the unlock permanent or temporary?
- [ ] When does it reset? (1st of month, or 30 days from last use?)

**My Suggestion:** ONE video up to 30 minutes long, permanent unlock, resets on 1st of each month.

---

### 4. **Video Unlocks & Expiration**
**Question:** When someone purchases/unlocks a video, how long do they have access?
- [ ] Permanent access?
- [ ] Expires after X days?
- [ ] Different for free vs paid unlocks?

**My Suggestion:** 
- Free monthly unlock: Permanent
- Purchased videos: Permanent
- VIP subscription: Access while subscribed
- Super Hxmp: Permanent after purchase

---

### 5. **Hxmpa' Creators**
**Question:** Who are Hxmpa' creators and how does it work?
- [ ] Are these users who upload their own content?
- [ ] Do they get paid when their content is purchased?
- [ ] What's the revenue split? (e.g., 70% creator, 30% platform)
- [ ] Do you approve content before it goes live?
- [ ] Can anyone become a creator or must they apply?

**My Suggestion:** 
- Users can apply to become creators
- Admin approves applications
- Content must be approved before publishing
- 70/30 revenue split (70% to creator)
- Minimum $50 payout threshold

---

### 6. **Hxmpa' Wallet**
**Question:** How does the creator wallet work?
- [ ] What currency? (USD, crypto, both?)
- [ ] How often can creators request payouts?
- [ ] Minimum payout amount?
- [ ] Payout methods? (PayPal, bank transfer, crypto?)

**My Suggestion:**
- USD currency
- Weekly payout requests
- $50 minimum
- PayPal & bank transfer

---

### 7. **Video Passwords**
**Question:** What are video passwords for?
- [ ] Admin sets password per video?
- [ ] Users must enter password to unlock?
- [ ] Is this separate from purchases?
- [ ] What's the use case?

**My Suggestion:** Optional feature where admin can set a password for exclusive content (like early access codes, special events, etc.)

---

### 8. **Super Hxmp Content**
**Question:** What makes content "Super Hxmp"?
- [ ] Highest quality/exclusive content?
- [ ] Only available via individual purchase?
- [ ] Not included in VIP subscription?
- [ ] Different pricing tier?

**My Suggestion:** Premium exclusive content, requires separate purchase even for VIP members, higher price point ($20-50 per video).

---

### 9. **Gumroad Integration**
**Question:** How will Gumroad be used?
- [ ] For memberships only?
- [ ] For individual video purchases too?
- [ ] For Super Hxmp purchases?
- [ ] All of the above?

**My Suggestion:** Use Gumroad for:
- VIP membership subscriptions ($12.99/month)
- Individual video purchases
- Super Hxmp purchases
- Gallery purchases

---

### 10. **Gallery System**
**Question:** How do galleries work?
- [ ] Collections of photos/videos?
- [ ] Can users unlock entire gallery at once?
- [ ] Different pricing than individual items?
- [ ] Can creators make their own galleries?

**My Suggestion:**
- Galleries are themed collections (e.g., "Beach Photoshoot", "Studio Session")
- Users can purchase entire gallery at discount vs individual items
- Creators can organize their content into galleries
- VIP members get access to all galleries except Super Hxmp

---

### 11. **Content Upload Process**
**Question:** How does content get uploaded?
- [ ] Admin uploads everything?
- [ ] Creators can upload directly?
- [ ] Approval workflow?
- [ ] File size limits?
- [ ] Supported formats?

**My Suggestion:**
- Admin can upload directly (auto-approved)
- Creators upload to pending queue
- Admin reviews and approves/rejects
- Max 2GB per file
- Formats: MP4, MOV for video; JPG, PNG for photos

---

### 12. **Messaging System**
**Question:** How does messaging work?
- [ ] User-to-admin only?
- [ ] User-to-creator?
- [ ] User-to-user?
- [ ] Real-time or email-style?

**My Suggestion:**
- VIP users can message admin/support
- VIP users can message creators
- No user-to-user messaging (privacy)
- Email-style (not real-time chat)

---

## 📋 **Quick Decision Template**

Copy and fill this out:

```
1. Watch Time: 1 hour per day, resets at midnight
2. Ads: Google AdSense, 3x per day, +30min each
3. Free Unlock: 1 video up to 30min, permanent, monthly reset
4. Paid Unlocks: Permanent access
5. Creators: Apply → Approve → Upload → Review → Publish
6. Revenue Split: 70% creator / 30% platform
7. Wallet: USD, $50 minimum, PayPal/Bank
8. Passwords: Optional admin-set codes for exclusive content
9. Super Hxmp: Premium content, separate purchase, $20-50
10. Gumroad: All payments (memberships + purchases)
11. Galleries: Collections, bulk purchase discount
12. Upload: Admin direct, creators pending approval, 2GB max
13. Messaging: VIP only, user→admin, user→creator
```

---

**Once you answer these, we can finalize the schema and start building!** 🚀
