import type { SponsorshipPlan, User } from '@/prisma/generated';
import type { SessionMetadata } from '@/src/shared/types/session-metadata.types';

export const MESSAGES = {
  welcome:
    `<b>👋 Welcome to TeaStream Bot!</b>\n\n` +
    `If you want to recieve telegram notifications and enhance your TeaStream experience, connect your TeaStream account with Telegram\n\n` +
    `Press the button below and visit <b>Notifications</b> tab to connect your account.`,
  authSuccess: `🎉 Successfully connected to Telegram!\n\n`,
  invalidToken: `❌ Your token is invalid or it has expired.`,
  profile: (user: User, followersCount: number) =>
    `<b>👤 ${user.displayName}'s Profile:</b>\n\n\n` +
    `👤 Username: <b>${user.username}</b>\n\n` +
    `📧 Email: <b>${user.email}</b>\n\n` +
    `👥 Followers: <b>${followersCount}</b>\n\n` +
    `📝 Bio: <b>${user.bio || 'None'}</b>\n\n` +
    `🔧Press the button below to edit your profile.`,
  following: (user: User) =>
    `📺 <a href="https://teastream.ru/${user.username}">${user.username}</a>`,
  followingList: (followingList: string) =>
    `<b>🌟 Channels you follow:</b>\n\n${followingList}`,
  noFollowing: `<b>😢 You are not followig anyone.</b>`,
  resetPassword: (metadata: SessionMetadata) =>
    `<b>🔐 Password reset</b>\n\n` +
    `You requested a password reset for your account on <b>TeaStream</b>.\n\n` +
    `Follow the link below to reset your password.\n\n` +
    `📅 <b>Request Date:</b> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n` +
    `🖥️ <b>Request information:</b>\n\n` +
    `🌍 <b>Location: ${metadata.location.country}, ${metadata.location.city}</b>\n` +
    `📱 <b>Operating system: ${metadata.device.os}</b>\n` +
    `🌐 <b>Browser: ${metadata.device.browser}</b>\n` +
    `💻 <b>IP address: ${metadata.ip}</b>\n\n` +
    `If you haven't made this request, please ignore this message.\n\n` +
    `Thank you for using TeaStream! 🚀\n\n`,
  deactivateAccount: (token: string, metadata: SessionMetadata) =>
    `<b>⚠️ Account Deactivation Request.</b>\n\n` +
    `You initiated a request to deactivate your account on <b>Teastream</b>.\n\n` +
    `To proceed with the deactivation process, enter the following verification code:\n\n` +
    `<b>Verification code: ${token}</b>\n\n` +
    `📅 <b>Request Date:</b> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n` +
    `🖥️ <b>Request information:</b>\n\n` +
    `🌍 <b>Location: ${metadata.location.country}, ${metadata.location.city}</b>\n` +
    `📱 <b>Operating system: ${metadata.device.os}</b>\n` +
    `🌐 <b>Browser: ${metadata.device.browser}</b>\n` +
    `💻 <b>IP address: ${metadata.ip}</b>\n\n` +
    `<b>What happens next?</b>\n\n` +
    `<b>1.</b> You will be automatically logged out from the system and account access will bw lost.\n` +
    `<b>2.</b> Unless you cancel the deactivation within 7 days, your account will be <b>permanently deleted</b> with all your personal informations and subscriptions.\n\n` +
    `<b>⌛ Pay attention!\n</b>If you change your mind within 7 days, you can contact the support team to cancel the deactivation process.\n\n` +
    `You will not be able to recover your account after the 7-day period and your data will be erased.\n\n` +
    `Please, ignore this mesage if you changed your mind or did not request account deactivation. Your account will not be deleted.\n\n` +
    `Thank you for your continued <b>TeaStream</b> support! We are always happy to have you here. 🚀\n\n` +
    `Sincerely,\n` +
    `TeaStream Team!`,
  accountDeleted:
    `<b>❗ Your account has been completely deleted.</b>\n\n` +
    `Your account has been completely erased from <b>TeaStream</b>. All your data and information have been permanently deleted.\n\n` +
    `🔒 You will no longer receive any email or Telegram notifications from <b>TeaStream</b>.\n\n` +
    `If you want to return to <b>TeaStream</b>, you can do it by signing up again\n` +
    `Thank you for your continued <b>TeaStream</b> support! We are always happy to have you here. 🚀\n\n` +
    `Sincerely,\n` +
    `TeaStream Team!`,
  streamStarted: (channel: User) =>
    `<b>📡 ${channel} has started a broadcast!</b>`,
  newFollower: (follower: User, followersCount: number) =>
    `🔔 <a href="https://teastream.ru/${follower.username}">${follower.displayName}</a> is now following you!\n\n` +
    `You have ${followersCount} followers now.`,
  newSponsorship: (plan: SponsorshipPlan, sponsor: User) =>
    `<b>🎉New Sponsorship!</b>\n\n` +
    `You have a new sponsor! <a href="https://teastream.ru/${sponsor.username}">${sponsor.displayName}</a> has sponsored you with <b>${plan.title}</b> plan!\n\n` +
    `💰 You will receive ${plan.price} per month from this sponsorship.\n` +
    `📅 This sponsorship will be active until ${new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}.\n\n` +
    `Thank you for using TeaStream! 🚀`,
  enableTwoFactor:
    `🔐Secure  your account with two-factor authentication!\n\n` +
    `Enable two-factor authentication in your <a href="https://teastream.ru/dashboard/settings">account settings</a>.`,
  channelVerified:
    `🎉Congratulations! Your channel has been verified!\n\n` +
    `We are glad to inform you that your channel has been successfully verified given an official badge.\n\n` +
    `Verification badge gives you more credibility and visibility on TeaStream.\n\n` +
    `Thank you for using TeaStream! 🚀`,
};
