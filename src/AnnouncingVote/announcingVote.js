import React from 'react'
import './style.css'
export default function AnnouncingVote() {
  return (
    <div className="announcing_form">
      <div className="krqetT"></div>
      <div className="ifKAln"></div>
      <div className="announcing ">
        <div>
          <h2 className="titleVote">Địa Điểm Được Vote Nhiều Nhất</h2>
        </div>
        <div className="listResultVote">
          <div className="vote">
            <h4 className="nameVote">Công Viên Yên Sở</h4> <h5 className="quantilyVote">10</h5>
          </div>
          <div className="vote">
            <h4 className="nameVote">Công Viên Yên Sở</h4> <h5 className="quantilyVote">10</h5>
          </div>
          <div className="vote">
            <h4 className="nameVote">Công Viên Yên Sở</h4> <h5 className="quantilyVote">10</h5>
          </div>
          <div className="vote">
            <h4 className="nameVote">Công Viên Yên Sở</h4> <h5 className="quantilyVote">10</h5>
          </div>
          <div className="vote">
            <h4 className="nameVote">Trường Đại Học Công Nghiệp Hà Nội Cơ Sở 3 Phủ lý Hà Nam</h4>{' '}
            <h5 className="quantilyVote">5</h5>
          </div>
        </div>
        <div style={{ width: '100% ', textAlign: 'center' }}>
          <button className="btnView">Xem Đường Đi</button>
        </div>
      </div>
    </div>
  )
}
