class FriendsList {
  friends = [];

  addFriend(name) {
    this.friends.push(name);
    this.announceFriendship(name);
  }

  announceFriendship(name) {
    global.console.log(`${name} is now a friend!`);
  }

  removeFriend(name) {
    const idx = this.friends.indexOf(name);

    if (idx === -1) {
      throw new Error('Friend not found!');
    }

    this.friends.splice(idx, 1);
  }
}

//tests
describe('FriendsList', () => {
  let friendsList;

  beforeEach(() => {
    friendsList = new FriendsList();
  });

  it('initialize friends list', () => {
    expect(friendsList.friends.length).toEqual(0);
  });

  it('adds a friend to the list', () => {
    friendsList.addFriend('Saphira');
    expect(friendsList.friends.length).toEqual(1);
  });

  it('announces friendship', () => {
    friendsList.announceFriendship = jest.fn();
    expect(friendsList.announceFriendship).not.toBeCalled();
    friendsList.addFriend('Saphira');
    expect(friendsList.announceFriendship).toBeCalled();
    expect(friendsList.announceFriendship).toHaveBeenCalledWith('Saphira');
  });

  describe('removeFriend', () => {
    it('removes a friend from the list', () => {
      friendsList.addFriend('Ariel');
      expect(friendsList.friends[0]).toEqual('Ariel');
      friendsList.removeFriend('Ariel');
      expect(friendsList.friends.length).toEqual(0);
    });

    it('throws an error as friend does not exist', () => {
      expect(() => friendsList.removeFriend('Saphira')).toThrow(
        new Error('Friend not found!'),
      );
    });
  });
});
