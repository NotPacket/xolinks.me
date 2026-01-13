import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/db";
import Link from "next/link";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

async function getProfile(username: string) {
  const cleanUsername = username.replace("@", "").toLowerCase();

  const user = await prisma.user.findUnique({
    where: { username: cleanUsername },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      theme: true,
      links: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          title: true,
          url: true,
          platform: true,
          icon: true,
          isVerified: true,
        },
      },
    },
  });

  return user;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    return { title: "User not found - xolinks.me" };
  }

  return {
    title: `${profile.displayName || profile.username} - xolinks.me`,
    description: profile.bio || `Check out ${profile.displayName || profile.username}'s links on xolinks.me`,
    openGraph: {
      title: `${profile.displayName || profile.username} - xolinks.me`,
      description: profile.bio || `Check out ${profile.displayName || profile.username}'s links`,
      images: profile.avatarUrl ? [profile.avatarUrl] : [],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="text-center mb-8">
          {/* Avatar */}
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/25">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName || profile.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              profile.displayName?.[0] || profile.username[0].toUpperCase()
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold text-white mb-1">
            {profile.displayName || profile.username}
          </h1>
          <p className="text-gray-400">@{profile.username}</p>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-3 text-gray-300 max-w-md mx-auto">{profile.bio}</p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-3">
          {profile.links.length === 0 ? (
            <p className="text-center text-gray-500">No links yet</p>
          ) : (
            profile.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full p-4 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 hover:border-purple-500/50 rounded-xl text-center text-white font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
              >
                <span className="flex items-center justify-center gap-2">
                  {link.title}
                  {link.isVerified && (
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </a>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            Create your own xolinks.me
          </Link>
        </div>
      </div>
    </div>
  );
}
