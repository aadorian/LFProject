import { Client, MessageEmbed } from "discord.js";
import Web3 from "web3";
import { fetchJson } from "fetch-json";
require("dotenv").config();

const AUTHOR = "Ale Adorjan";
const BOT_NAME = "LensBot";
const BOT_NAME_FOOTER = "LenBot";
const EMBED_COLOR_PRIMARY = 0xabfb2c;
const EMBED_COLOR_SECONDARY = 0xffffff;
const IMAGE_DEFAULT = "https://i.imgur.com/LbPBmJW.png";
const LOGO = "https://i.imgur.com/LbPBmJW.png";
const URL_BOT = "https://aurora.dev/";
const MNEMONIC = process.env.MNEMONIC;
const TOKEN_NAME = "LENS";
const QRY_FOLLOW = `https://api-mumbai.lens.dev/?query= 
query DoesFollow {
  doesFollow(request: { 
                followInfos: [
                  {
                    followerAddress: "0xD020E01C0c90Ab005A01482d34B808874345FD82",
                    profileId: "0x01"
                  },
                  {
                    followerAddress: "0x248ba21F6ff51cf0CD4765C3Bc9fAD2030a591d5",
                    profileId: "0x01"
                  }
                ] 
             }) {
    followerAddress
    profileId
    follows
  }
}

`;
const QRY_PROTOCOL = `https://api-mumbai.lens.dev/?query= 
query GlobalProtocolStats {
  globalProtocolStats(request: null) {
    totalProfiles
    totalBurntProfiles
    totalPosts
    totalMirrors
    totalComments
    totalCollects
    totalFollows
    totalRevenue {
      asset {
        name
        symbol
        decimals
        address
      }
      value
    }
  }
}

`;
const QRY_PUBLICATIONS = `https://api-mumbai.lens.dev/?query=
query ExplorePublications {
  explorePublications(request: {
    sortCriteria: TOP_COMMENTED,
    limit: 10
  }) {
    items {
      __typename 
      ... on Post {
        ...PostFields
      }
      ... on Comment {
        ...CommentFields
      }
      ... on Mirror {
        ...MirrorFields
      }
    }
    pageInfo {
      prev
      next
      totalCount
    }
  }
}

fragment MediaFields on Media {
  url
  width
  height
  mimeType
}

fragment ProfileFields on Profile {
  id
  name
  bio
  location
  website
  twitterUrl
  handle
  picture {
    ... on NftImage {
      contractAddress
      tokenId
      uri
      verified
    }
    ... on MediaSet {
      original {
        ...MediaFields
      }
      small {
        ...MediaFields
      }
      medium {
        ...MediaFields
      }
    }
  }
  coverPicture {
    ... on NftImage {
      contractAddress
      tokenId
      uri
      verified
    }
    ... on MediaSet {
      original {
        ...MediaFields
      }
      small {
       ...MediaFields
      }
      medium {
        ...MediaFields
      }
    }
  }
  ownedBy
  depatcher {
    address
  }
  stats {
    totalFollowers
    totalFollowing
    totalPosts
    totalComments
    totalMirrors
    totalPublications
    totalCollects
  }
  followModule {
    ... on FeeFollowModuleSettings {
      type
      amount {
        asset {
          name
          symbol
          decimals
          address
        }
        value
      }
      recipient
    }
  }
}

fragment PublicationStatsFields on PublicationStats { 
  totalAmountOfMirrors
  totalAmountOfCollects
  totalAmountOfComments
}

fragment MetadataOutputFields on MetadataOutput {
  name
  description
  content
  media {
    original {
      ...MediaFields
    }
    small {
      ...MediaFields
    }
    medium {
      ...MediaFields
    }
  }
  attributes {
    displayType
    traitType
    value
  }
}

fragment Erc20Fields on Erc20 {
  name
  symbol
  decimals
  address
}

fragment CollectModuleFields on CollectModule {
  __typename
  ... on EmptyCollectModuleSettings {
    type
  }
  ... on FeeCollectModuleSettings {
    type
    amount {
      asset {
        ...Erc20Fields
      }
      value
    }
    recipient
    referralFee
  }
  ... on LimitedFeeCollectModuleSettings {
    type
    collectLimit
    amount {
      asset {
        ...Erc20Fields
      }
      value
    }
    recipient
    referralFee
  }
  ... on LimitedTimedFeeCollectModuleSettings {
    type
    collectLimit
    amount {
      asset {
        ...Erc20Fields
      }
      value
    }
    recipient
    referralFee
    endTimestamp
  }
  ... on RevertCollectModuleSettings {
    type
  }
  ... on TimedFeeCollectModuleSettings {
    type
    amount {
      asset {
        ...Erc20Fields
      }
      value
    }
    recipient
    referralFee
    endTimestamp
  }
}

fragment PostFields on Post {
  id
  profile {
    ...ProfileFields
  }
  stats {
    ...PublicationStatsFields
  }
  metadata {
    ...MetadataOutputFields
  }
  createdAt
  collectModule {
    ...CollectModuleFields
  }
  referenceModule {
    ... on FollowOnlyReferenceModuleSettings {
      type
    }
  }
  appId
}

fragment MirrorBaseFields on Mirror {
  id
  profile {
    ...ProfileFields
  }
  stats {
    ...PublicationStatsFields
  }
  metadata {
    ...MetadataOutputFields
  }
  createdAt
  collectModule {
    ...CollectModuleFields
  }
  referenceModule {
    ... on FollowOnlyReferenceModuleSettings {
      type
    }
  }
  appId
}

fragment MirrorFields on Mirror {
  ...MirrorBaseFields
  mirrorOf {
   ... on Post {
      ...PostFields          
   }
   ... on Comment {
      ...CommentFields          
   }
  }
}

fragment CommentBaseFields on Comment {
  id
  profile {
    ...ProfileFields
  }
  stats {
    ...PublicationStatsFields
  }
  metadata {
    ...MetadataOutputFields
  }
  createdAt
  collectModule {
    ...CollectModuleFields
  }
  referenceModule {
    ... on FollowOnlyReferenceModuleSettings {
      type
    }
  }
  appId
}

fragment CommentFields on Comment {
  ...CommentBaseFields
  mainPost {
    ... on Post {
      ...PostFields
    }
    ... on Mirror {
      ...MirrorBaseFields
      mirrorOf {
        ... on Post {
           ...PostFields          
        }
        ... on Comment {
           ...CommentMirrorOfFields        
        }
      }
    }
  }
}

fragment CommentMirrorOfFields on Comment {
  ...CommentBaseFields
  mainPost {
    ... on Post {
      ...PostFields
    }
    ... on Mirror {
       ...MirrorBaseFields
    }
  }

}`;
console.log(`Starting bot...`);
console.log(`Connecting web3 to ..`);
console.log("Api " + process.env.API_KEY);

const client: Client = new Client();
const web3 = new Web3(process.env.RPC_URL);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  try {
    if (msg.content === "!ping") {
      const url = "https://api-mumbai.lens.dev/?query= query {ping}";
      const data = await fetchJson.get(url);
      console.log(data.data);
      const accountBalance = data.data["ping"];
      const msgEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR_PRIMARY)
        .setDescription(BOT_NAME)
        .setURL(URL_BOT)
        .setAuthor("Author: " + AUTHOR, IMAGE_DEFAULT, URL_BOT)
        .setThumbnail(LOGO)
        .addField("Lens response: ", `${accountBalance}`)
        .setImage(LOGO)
        .setFooter(BOT_NAME_FOOTER, IMAGE_DEFAULT)
        .setTimestamp();
      msg.channel.send(msgEmbed);

      client.user.setActivity("ping", { type: "WATCHING" });
      // client.user.setAvatar(IMAGE_DEFAULT)
    }
    if (msg.content === "!publications") {
      const url = QRY_PUBLICATIONS;
      const data = await fetchJson.get(url);
      console.log(data.data.explorePublications.items[0].id);
      const msgEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR_PRIMARY)
        .setDescription(BOT_NAME)
        .setURL(URL_BOT)
        .setAuthor("Author: " + AUTHOR, IMAGE_DEFAULT, URL_BOT)
        .setThumbnail(LOGO)
        .addFields(
          {
            name: "ID: ",
            value: data.data.explorePublications.items[0].id,
            inline: false,
          },
          {
            name: "Title: ",
            value: data.data.explorePublications.items[0].metadata.name,
            inline: false,
          },
          {
            name: "Description: ",
            value: data.data.explorePublications.items[0].metadata.description,
            inline: false,
          },
          {
            name: "Created at: ",
            value: data.data.explorePublications.items[0].createdAt,
            inline: false,
          },
          {
            name: "Collect module: ",
            value: data.data.explorePublications.items[0].collectModule.type,
            inline: false,
          }
        )
        .setImage(LOGO)
        .setFooter(BOT_NAME_FOOTER, IMAGE_DEFAULT)
        .setTimestamp();
      msg.channel.send(msgEmbed);

      client.user.setActivity("publication", { type: "WATCHING" });

    }
    if (msg.content === "!status") {
      const url = QRY_PROTOCOL;
      const data = await fetchJson.get(url);

      const msgEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR_PRIMARY)
        .setDescription(BOT_NAME)
        .setURL(URL_BOT)
        .setAuthor("Author: " + AUTHOR, IMAGE_DEFAULT, URL_BOT)
        .setThumbnail(LOGO)
        .addFields(
          {
            name: "Total Profiles: ",
            value: data.data.globalProtocolStats.totalProfiles,
            inline: false,
          },
          {
            name: "Total Burn Profiles: ",
            value: data.data.globalProtocolStats.totalBurntProfiles,
            inline: false,
          },
          {
            name: "Total Posts: ",
            value: data.data.globalProtocolStats.totalPosts,
            inline: false,
          },
          {
            name: "Total Mirrors: ",
            value: data.data.globalProtocolStats.totalMirrors,
            inline: false,
          },
          {
            name: "Total Comments: ",
            value: data.data.globalProtocolStats.totalComments,
            inline: false,
          },
          {
            name: "Total Collects: ",
            value: data.data.globalProtocolStats.totalCollects,
            inline: false,
          }
        )
        .setImage(LOGO)
        .setFooter(BOT_NAME_FOOTER, IMAGE_DEFAULT)
        .setTimestamp();
      msg.channel.send(msgEmbed);

      client.user.setActivity("status", { type: "WATCHING" });

    }
    if (msg.content === "!follow") {
      const url = QRY_FOLLOW;
      const data = await fetchJson.get(url);
      console.log(data.data.doesFollow[0]);
      console.log(data.data.doesFollow[1]);
      console.log("");
      const msgEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR_PRIMARY)
        .setDescription(BOT_NAME)
        .setURL(URL_BOT)
        .setAuthor("Author: " + AUTHOR, IMAGE_DEFAULT, URL_BOT)
        .setThumbnail(LOGO)
        .addFields(
          {
            name: "address: ",
            value: data.data.doesFollow[0].followerAddress,
            inline: false,
          },
          {
            name: "follows: ",
            value: data.data.doesFollow[0].follows,
            inline: true,
          },
          {
            name: "profileId: ",
            value: data.data.doesFollow[0].profileId,
            inline: true,
          }
        )
        .addFields(
          {
            name: "address: ",
            value: data.data.doesFollow[1].followerAddress,
            inline: false,
          },
          {
            name: "follows: ",
            value: data.data.doesFollow[1].follows,
            inline: true,
          },
          {
            name: "profileId: ",
            value: data.data.doesFollow[1].profileId,
            inline: true,
          }
        )
        .setImage(LOGO)
        .setFooter(BOT_NAME_FOOTER, IMAGE_DEFAULT)
        .setTimestamp();
      msg.channel.send(msgEmbed);

      client.user.setActivity("follow", { type: "WATCHING" });

    }
  } catch (e) {
    msg.reply("ERROR");
    console.log(new Date().toISOString(), "ERROR", e.stack || e);
  }
});

client.login(process.env.DISCORD_TOKEN);
